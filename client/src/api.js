import axios from 'axios';

// یک نمونه axios با آدرس پایه می‌سازیم.
// پراکسی که در مرحله بعد در package.json اضافه می‌کنیم، این آدرس را به http://localhost:3001 هدایت می‌کند.
const api = axios.create({
  baseURL: '/api',
});

// با استفاده از یک رهگیر (interceptor)، توکن را به صورت خودکار به هدر تمام درخواست‌ها اضافه می‌کنیم.
api.interceptors.request.use(
  (config) => {
    // اطلاعات نشست (session) را از حافظه محلی مرورگر می‌خوانیم.
    const sessionDataString = localStorage.getItem('supabaseSession');
    if (sessionDataString) {
      const session = JSON.parse(sessionDataString);
      const token = session.access_token;

      if (token) {
        // توکن را به عنوان Bearer token به هدر Authorization اضافه می‌کنیم.
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    // مدیریت خطاهای درخواست
    return Promise.reject(error);
  }
);

// با استفاده از رهگیر پاسخ، خطاهای 401 را به صورت سراسری مدیریت می‌کنیم.
api.interceptors.response.use(
  (response) => response, // اگر پاسخ موفقیت‌آمیز بود، آن را برمی‌گردانیم.
  (error) => {
    // چک می‌کنیم که آیا خطا از نوع 401 Unauthorized است یا خیر.
    if (error.response && error.response.status === 401) {
      // نشست نامعتبر را از حافظه محلی پاک می‌کنیم.
      localStorage.removeItem('supabaseSession');
      // کاربر را به صفحه لاگین هدایت می‌کنیم.
      window.location.href = '/join';
    }
    // برای خطاهای دیگر، فقط آن‌ها را برمی‌گردانیم.
    return Promise.reject(error);
  }
);

export default api;