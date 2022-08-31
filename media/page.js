function initDoc(text){  
    var container = document.getElementById('jsoneditor');
    var options = {   mode: 'view',
                        modes: ['view', 'code', 'text', 'tree'],
                        onModeChange: function (newMode, oldMode) {
                            console.log('Mode switched from', oldMode, 'to', newMode);
                            container.style.height = window.innerHeight + "px";
                          }
                    };
    var editor = new JSONEditor(container, options, text);
    container.style.height = window.innerHeight + "px";
}   