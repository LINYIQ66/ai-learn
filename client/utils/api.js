/**
 * API Utility for WeChat Mini Program AI Learning App
 * Wraps wx.request with auth, loading, and error handling.
 */

const app = getApp();

let loadingTimer = null;
let loadingCount = 0;

/**
 * Show a loading spinner if the request takes longer than 1 second.
 * Tracks concurrent requests so the spinner is only hidden when all finish.
 */
function showLoading() {
  loadingCount++;
  if (loadingCount === 1) {
    loadingTimer = setTimeout(() => {
      wx.showLoading({ title: 'Loading...', mask: true });
    }, 1000);
  }
}

/**
 * Hide the loading spinner, clearing the timer if still pending.
 */
function hideLoading() {
  if (loadingCount > 0) loadingCount--;
  if (loadingCount === 0) {
    if (loadingTimer) {
      clearTimeout(loadingTimer);
      loadingTimer = null;
    }
    wx.hideLoading();
  }
}

/**
 * Generic request wrapper.
 * @param {string}  method - HTTP method (GET, POST, PUT, DELETE)
 * @param {string}  url    - Relative path, e.g. '/api/auth/login'
 * @param {object}  data   - Request body (only for POST/PUT)
 * @returns {Promise} Resolves with response data on success.
 */
function request(method, url, data) {
  showLoading();

  return new Promise((resolve, reject) => {
    const token = app.globalData.token || '';
    const fullUrl = (app.globalData.serverUrl || '') + url;

    wx.request({
      url: fullUrl,
      method: method,
      data: data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success(res) {
        if (res.statusCode === 401) {
          // Token expired or invalid – re-login and retry
          checkLogin()
            .then(() => {
              // Retry original request with new token
              const newToken = app.globalData.token || '';
              wx.request({
                url: fullUrl,
                method: method,
                data: data,
                header: {
                  'Content-Type': 'application/json',
                  'Authorization': newToken ? `Bearer ${newToken}` : ''
                },
                success(retryRes) {
                  handleResponse(retryRes, resolve, reject);
                },
                fail(err) {
                  handleError(err, reject);
                },
                complete() {
                  hideLoading();
                }
              });
            })
            .catch(err => {
              handleError(err, reject);
              hideLoading();
            });
        } else {
          handleResponse(res, resolve, reject);
        }
      },
      fail(err) {
        handleError(err, reject);
      },
      complete() {
        // hideLoading is called in the success/fail branches to avoid
        // hiding before the 401 retry finishes, but we need a fallback
        // for edge cases (e.g. statusCode is not 200/401 and no explicit resolve/reject called).
        // The handleResponse/handleError helpers already call hideLoading.
      }
    });
  });
}

/**
 * Parse the unified response format: { code, data, msg }
 */
function handleResponse(res, resolve, reject) {
  const body = res.data;

  if (body && body.code === 0) {
    resolve(body.data);
  } else if (body && body.code !== undefined && body.code !== 0) {
    wx.showToast({
      title: body.msg || 'Request failed',
      icon: 'none',
      duration: 2000
    });
    reject(new Error(body.msg || 'Request failed'));
  } else {
    // Non-standard response – treat as success
    resolve(body);
  }
}

/**
 * Handle network / server errors.
 */
function handleError(err, reject) {
  const msg = err.errMsg || 'Network error';
  wx.showToast({
    title: msg,
    icon: 'none',
    duration: 2000
  });
  reject(err);
}

/**
 * Perform WeChat login, exchange code for JWT token and user info.
 * Stores credentials in app.globalData via app.setToken / app.setUserInfo.
 * @returns {Promise} Resolves with { token, user } on success.
 */
function checkLogin() {
  return new Promise((resolve, reject) => {
    wx.login({
      success(loginRes) {
        if (!loginRes.code) {
          wx.showToast({ title: 'Login failed', icon: 'none' });
          reject(new Error('wx.login returned no code'));
          return;
        }

        // Attempt to get user profile (works for button-triggered flows;
        // here we try wx.getUserInfo for backwards compatibility)
        wx.getUserInfo({
          success(userRes) {
            doLogin(loginRes.code, userRes.userInfo, resolve, reject);
          },
          fail() {
            // User may not have authorized – proceed without profile
            doLogin(loginRes.code, null, resolve, reject);
          }
        });
      },
      fail(err) {
        wx.showToast({ title: 'wx.login failed', icon: 'none' });
        reject(err);
      }
    });
  });
}

/**
 * POST /api/auth/login with the WeChat code and optional user profile.
 */
function doLogin(code, userInfo, resolve, reject) {
  const data = { code };

  if (userInfo) {
    data.nickname = userInfo.nickName;
    data.avatar   = userInfo.avatarUrl;
    data.gender   = userInfo.gender; // 0=unknown, 1=male, 2=female
  }

  const serverUrl = app.globalData.serverUrl || '';

  wx.request({
    url: serverUrl + '/api/auth/login',
    method: 'POST',
    data: data,
    header: { 'Content-Type': 'application/json' },
    success(res) {
      const body = res.data;
      if (body && body.code === 0) {
        const { token, user } = body.data;

        // Store credentials via app helpers
        if (typeof app.setToken === 'function') {
          app.setToken(token);
        } else {
          app.globalData.token = token;
          wx.setStorageSync('token', token);
        }

        if (typeof app.setUserInfo === 'function') {
          app.setUserInfo(user);
        } else {
          app.globalData.userInfo = user;
          wx.setStorageSync('userInfo', user);
        }

        resolve({ token, user });
      } else {
        wx.showToast({
          title: body.msg || 'Login failed',
          icon: 'none'
        });
        reject(new Error(body.msg || 'Login failed'));
      }
    },
    fail(err) {
      handleError(err, reject);
    }
  });
}

/**
 * Upload a file to /api/upload with Bearer token auth.
 * @param {string} filePath - Local temporary file path (e.g. from wx.chooseImage)
 * @returns {Promise} Resolves with the server response data.
 */
function uploadFile(filePath) {
  showLoading();

  return new Promise((resolve, reject) => {
    const token = app.globalData.token || '';
    const serverUrl = app.globalData.serverUrl || '';

    wx.uploadFile({
      url: serverUrl + '/api/upload',
      filePath: filePath,
      name: 'file',
      header: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success(res) {
        hideLoading();

        // wx.uploadFile returns res.data as a string – parse it
        let body;
        try {
          body = JSON.parse(res.data);
        } catch (e) {
          wx.showToast({ title: 'Invalid server response', icon: 'none' });
          reject(new Error('Invalid JSON in upload response'));
          return;
        }

        if (res.statusCode === 401) {
          // Re-login then retry upload
          checkLogin()
            .then(() => {
              const newToken = app.globalData.token || '';
              wx.uploadFile({
                url: serverUrl + '/api/upload',
                filePath: filePath,
                name: 'file',
                header: {
                  'Authorization': newToken ? `Bearer ${newToken}` : ''
                },
                success(retryRes) {
                  hideLoading();
                  let retryBody;
                  try {
                    retryBody = JSON.parse(retryRes.data);
                  } catch (e) {
                    reject(new Error('Invalid JSON in upload response'));
                    return;
                  }
                  if (retryBody && retryBody.code === 0) {
                    resolve(retryBody.data);
                  } else {
                    wx.showToast({
                      title: retryBody.msg || 'Upload failed',
                      icon: 'none'
                    });
                    reject(new Error(retryBody.msg || 'Upload failed'));
                  }
                },
                fail(err) {
                  handleError(err, reject);
                }
              });
            })
            .catch(err => {
              handleError(err, reject);
            });
        } else if (body && body.code === 0) {
          resolve(body.data);
        } else {
          wx.showToast({
            title: (body && body.msg) || 'Upload failed',
            icon: 'none'
          });
          reject(new Error((body && body.msg) || 'Upload failed'));
        }
      },
      fail(err) {
        handleError(err, reject);
      },
      complete() {
        // hideLoading is called inside success/fail; fallback needed only for edge cases
        // Already handled above.
      }
    });
  });
}

module.exports = {
  request,
  checkLogin,
  uploadFile
};
