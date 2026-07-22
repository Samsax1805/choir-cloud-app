export const storage = {
  get: <T,>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage write failed (quota exceeded?):', e);
      alert('Storage quota exceeded. Try clearing some data.');
    }
  },
  remove: (key: string) => {
    localStorage.removeItem(key);
  },
  clearAll: () => {
    if (confirm('This will delete ALL data. Are you sure?')) {
      localStorage.clear();
      location.reload();
    }
  }
};