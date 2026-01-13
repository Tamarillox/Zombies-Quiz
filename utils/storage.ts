
export const saveToLocalStorage = (key: string, data: any) => {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
  } catch (error: any) {
    if (error.name === 'QuotaExceededError' || error.code === 22 || error.message?.includes('quota')) {
      console.warn('LocalStorage Quota Exceeded. Data not saved.');
      alert("SPEICHER VOLL! \n\nDein Browser-Speicherplatz für diese App ist aufgebraucht. Der Fortschritt konnte nicht gespeichert werden.");
    } else {
      console.error("Storage Error:", error);
    }
  }
};
