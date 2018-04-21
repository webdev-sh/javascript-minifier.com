// banner.js v1
(function() {

  // valid values
  var valid = {
    position : {
      'top' : 'absolute',
      'sticky' : 'fixed',
    },
  }

  // <div#banner>
  var banner = document.getElementById('banner');

  // get the dataset to use
  var dataset = banner.dataset;
  // default some things
  dataset.position = dataset.position || 'top'

  banner.style.position = valid.position[dataset.position] || 'absolute';
  banner.style.top = '-70px';
  banner.style.right = '-70px';
  banner.style.width = '300px';
  banner.style.height = '300px';
  banner.style['z-index'] = 9999;
  banner.style.display = 'flex';
  banner.style['align-items'] = 'center';

  // <a>
  var a = banner.firstElementChild;

  a.style.display = 'block';
  a.style.position = 'relative';
  a.style['text-decoration'] = 'none';
  a.style['text-align'] = 'center';
  a.style['font-weight'] = 'bold';
  a.style.overflow = 'hidden';
  a.style.background = dataset.bgColor || '#282';
  a.style.color = dataset.color || '#fff';
  a.style['line-height'] = (String(dataset.lineHeight) || 2) + 'rem';
  a.style.transform = 'rotate(45deg)';
  a.style['box-shadow'] = '4px 4px 10px rgba(0,0,0,0.8)';
  a.style.width = '300px';

  // to stop the initial 'turn', add this shortly afterwards
  setTimeout(function() {
    a.style.transition = '0.5s';
  }, 50);

  // event listeners
  a.addEventListener('mouseenter', function(event) {
    event.target.style.background = dataset.bgHover || '#c11';
  });
  a.addEventListener('mouseout', function(event) {
    event.target.style.background = dataset.bgColor || '#282';
  });

})();
