import '@testing-library/jest-dom';

// jsdom (the browser simulator Jest uses) doesn't implement scrollIntoView.
// This mock prevents errors in components that call it.
window.HTMLElement.prototype.scrollIntoView = jest.fn();
