const copy = async (text: string) => {
  // confirm user if he wants to open the folder or not via confirm alert
  const confirmOpen = confirm('Do you want to copy this text to clipboard?');
  if (!confirmOpen) return;

  navigator.clipboard.writeText(text);
};

export default copy;
