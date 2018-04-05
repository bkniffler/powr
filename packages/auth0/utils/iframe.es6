const timeout = 60 * 1000;
export default (url, fullscreen) =>
  new Promise((yay, nay) => {
    const destroy = () => {
      clearTimeout(timeoutHandle);
      window.iframeDidLoad = null;
      document.body.removeChild(iframe);
    };

    const iframe = document.createElement('iframe');
    iframe.style.border = 'none';
    if (fullscreen === true) {
      iframe.style.position = 'fixed';
      iframe.style.zIndex = 999999;
      iframe.style.top = '0px';
      iframe.style.left = '0px';
      iframe.style.right = '0px';
      iframe.style.bottom = '0px';
      iframe.style.width = '100%';
      iframe.style.height = '100%';
    } else {
      iframe.style.display = 'none';
    }
    document.body.appendChild(iframe);

    window.iframeDidLoad = () => {
      try {
        const href = iframe.contentWindow.location.href;
        destroy();
        yay(href);
      } catch (err) {}
    };
    iframe.setAttribute('onLoad', 'iframeDidLoad();');
    iframe.setAttribute('src', url);

    const timeoutHandle = setTimeout(() => {
      destroy();
      nay(new Error('Timeout'));
    }, fullscreen === true ? timeout * 1000 : timeout);
  });
