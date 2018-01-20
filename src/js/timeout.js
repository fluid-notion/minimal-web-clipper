export const timeout = (duration) => new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve();
    }, duration);
});
