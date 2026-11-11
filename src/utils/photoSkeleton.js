// Demo build: a loading placeholder behind a photo (`.photoSkeleton`, src/App.scss), as in the ERP.
// It is taken off once the photo has loaded (or failed), so it never shows around a photo drawn
// with `object-fit: contain`. Placeholder icons don't get it: pass isPhoto = false.
const done = (e) => e.currentTarget.classList.remove('photoSkeleton');

export const photoSkeleton = (className, isPhoto = true) => (
    isPhoto
        ? {className: className ? `${className} photoSkeleton` : 'photoSkeleton', onLoad: done, onError: done}
        : {className: className || undefined}
);
