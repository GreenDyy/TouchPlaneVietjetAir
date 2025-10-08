/**
 * Utils.js - Các hàm tiện ích chung
 * Cú pháp ES5 tương thích với Chrome 44 / Android 6
 */

/**
 * Hàm gọi API với XMLHttpRequest (ES5)
 * 
 * @param {Object} config - Cấu hình API call
 * @param {string} config.method - Phương thức HTTP (GET, POST, PUT, DELETE, etc.)
 * @param {string} config.url - URL của API endpoint
 * @param {Object|string} config.data - Dữ liệu gửi đi (cho POST, PUT)
 * @param {Object} config.headers - Custom headers
 * @param {Function} config.onSuccess - Callback khi thành công
 * @param {Function} config.onError - Callback khi có lỗi
 * 
 * @example
 * // GET request
 * callAPI({
 *     method: 'GET',
 *     url: 'https://api.example.com/data',
 *     onSuccess: function(response) {
 *         console.log('Success:', response);
 *     },
 *     onError: function(error) {
 *         console.log('Error:', error);
 *     }
 * });
 * 
 * @example
 * // POST request
 * callAPI({
 *     method: 'POST',
 *     url: 'https://api.example.com/data',
 *     data: { name: 'John', age: 30 },
 *     headers: { 'Content-Type': 'application/json' },
 *     onSuccess: function(response) {
 *         console.log('Created:', response);
 *     },
 *     onError: function(error) {
 *         console.log('Error:', error);
 *     }
 * });
 */
function callAPI(config) {
    var xhr = new XMLHttpRequest();
    var method = config.method || 'GET';
    var url = config.url;
    var data = config.data || null;
    var headers = config.headers || {};
    var onSuccess = config.onSuccess || function() {};
    var onError = config.onError || function() {};
    
    // Mở connection
    xhr.open(method, url, true);
    
    // Set headers
    for (var key in headers) {
        if (headers.hasOwnProperty(key)) {
            xhr.setRequestHeader(key, headers[key]);
        }
    }
    
    // Xử lý response
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) { // DONE
            if (xhr.status >= 200 && xhr.status < 300) {
                // Thành công
                try {
                    var response = JSON.parse(xhr.responseText);
                    onSuccess(response);
                } catch (e) {
                    // Nếu response không phải JSON, trả về text
                    onSuccess(xhr.responseText);
                }
            } else {
                // Lỗi từ server
                onError({
                    status: xhr.status,
                    statusText: xhr.statusText,
                    response: xhr.responseText
                });
            }
        }
    };
    
    // Xử lý lỗi network
    xhr.onerror = function() {
        onError({
            status: 0,
            statusText: 'Network Error',
            response: null
        });
    };
    
    // Xử lý timeout (nếu được set)
    if (config.timeout) {
        xhr.timeout = config.timeout;
        xhr.ontimeout = function() {
            onError({
                status: 0,
                statusText: 'Request Timeout',
                response: null
            });
        };
    }
    
    // Gửi request
    if (data) {
        if (typeof data === 'object') {
            // Tự động stringify object thành JSON
            xhr.send(JSON.stringify(data));
        } else {
            // Gửi string/FormData trực tiếp
            xhr.send(data);
        }
    } else {
        xhr.send();
    }
}

