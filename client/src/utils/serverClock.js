let offset = 0;

export const syncServerTime = (serverTime) => {
    if (typeof serverTime === 'number') {
        offset = serverTime - Date.now();
    }
};

export const serverNow = () => Date.now() + offset;