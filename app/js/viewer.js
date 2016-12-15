// reference to the library UI module.
const { UI } = PDFAnnotate;

// name of the document loaded
var documentId = '';

if (window.parent.isDebug) {
  documentId = 'example.pdf';
}

let PAGE_HEIGHT;
var RENDER_OPTIONS = {
  documentId,
  currentPage: 0 ,
  pdfDocument: null,
  scale: 1,
  rotate: 0
};

// use the localstorage to store the annotations.
PDFAnnotate.setStoreAdapter(new PDFAnnotate.LocalStoreAdapter());
PDFJS.workerSrc = './shared/pdf.worker.js';

var NUM_PAGES = 0;
// keep track of rendered pages to prevent rendering it twice. (library bug)
var renderedPages = [];

// event handler for scrolling the document.
document.getElementById('content-wrapper').addEventListener('scroll', function(
  e) {
  var visiblePageNum = Math.round(e.target.scrollTop / (PAGE_HEIGHT / 2)) + 1;
  window.RENDER_OPTIONS.currentPage = Math.round(e.target.scrollTop / (PAGE_HEIGHT)) + 1;
  document.getElementById('currentPage').innerHTML = window.RENDER_OPTIONS.currentPage;
  var visiblePage = document.querySelector('.page[data-page-number="' +
    visiblePageNum + '"][data-loaded="false"]');
  if (visiblePage) {
    setTimeout(function() {
      if (renderedPages.indexOf(visiblePageNum) == -1) {
        UI.renderPage(visiblePageNum, RENDER_OPTIONS);
        renderedPages.push(visiblePageNum);
        UI.renderPage(visiblePageNum + 1, RENDER_OPTIONS);
        renderedPages.push(visiblePageNum + 1);
      }
    });
  }
});

/**
 * This function creates the HTML representation of the document's pages and
 * renders the first two pages when the document is loaded.
 */
function render() {
  renderedPages = [];
  PDFJS.getDocument(RENDER_OPTIONS.documentId).then(function(pdf) {
    RENDER_OPTIONS.pdfDocument = pdf;
    var viewer = document.getElementById('viewer');
    viewer.innerHTML = '';
    NUM_PAGES = pdf.pdfInfo.numPages;
    document.getElementById('pageTracker').style = 'display: inline';
    document.getElementById('totalPages').innerHTML = NUM_PAGES;
    for (var i = 0; i < NUM_PAGES; i++) {
      var page = UI.createPage(i + 1);
      viewer.appendChild(page);
    }
    UI.renderPage(1, RENDER_OPTIONS).then(function(_ref) {
      renderedPages.push(1);
      var pdfPage = _ref[0];
      var annotations = _ref[1];
      var viewport = pdfPage.getViewport(RENDER_OPTIONS.scale,
        RENDER_OPTIONS.rotate);
      PAGE_HEIGHT = viewport.height;
      UI.renderPage(2, RENDER_OPTIONS);
      renderedPages.push(2);
    });
  });

}

if (window.parent.isDebug) {
  render();
}

// this function handles the toolbar buttons.
(function() {
  let tooltype = localStorage.getItem(`${RENDER_OPTIONS.documentId}/tooltype`) ||
    'cursor';
  if (tooltype) {
    setActiveToolbarItem(tooltype, document.querySelector(
      `.toolbar button[data-tooltype=${tooltype}]`));
  }

  function setActiveToolbarItem(type, button) {
    let active = document.querySelector('.toolbar button.active');
    if (active) {
      active.classList.remove('active');

      switch (tooltype) {
        case 'cursor':
          UI.disableEdit();
          break;
        case 'highlight':
          UI.disableRect();
          break;
      }
    }

    if (button) {
      button.classList.add('active');
    }
    if (tooltype !== type) {
      localStorage.setItem(`${RENDER_OPTIONS.documentId}/tooltype`, type);
    }
    tooltype = type;

    switch (type) {
      case 'cursor':
        UI.enableEdit();
        break;
      case 'highlight':
        UI.enableRect(type);
        break;
    }
  }

  function handleToolbarClick(e) {
    if (e.target.nodeName === 'BUTTON') {
      setActiveToolbarItem(e.target.getAttribute('data-tooltype'), e.target);
    } else if (e.target.parentElement.id == 'cancelTagging') {
      window.pendingRelation = {};
      document.getElementById('taggingRelation').style = 'display: none';
      window.getSelection().empty();
    }
  }

  document.querySelector('.toolbar').addEventListener('click',
    handleToolbarClick);
})();

// this function is executed whenever the document is scaled.
(function() {
  function setScaleRotate(scale) {
    scale = parseFloat(scale, 10);

    if (RENDER_OPTIONS.scale !== scale) {
      RENDER_OPTIONS.scale = scale;
      localStorage.setItem(`${RENDER_OPTIONS.documentId}/scale`,
        RENDER_OPTIONS.scale);
      render();
    }
  }

  function handleScaleChange(e) {
    setScaleRotate(e.target.value, RENDER_OPTIONS.rotate);
  }

  document.querySelector('.toolbar select.scale').value = RENDER_OPTIONS.scale;
  document.querySelector('.toolbar select.scale').addEventListener('change',
    handleScaleChange);
})();
