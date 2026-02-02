const content_dir = 'contents/'
const config_file = 'config.yml'
const section_names = ['home', 'awards', 'experience', 'publications'];


window.addEventListener('DOMContentLoaded', event => {

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 74,
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });


    // Yaml
    fetch(content_dir + config_file)
        .then(response => response.text())
        .then(text => {
            const yml = jsyaml.load(text);
            // Check if yml is not null or undefined
            if (yml && typeof yml === 'object') {
                Object.keys(yml).forEach(key => {
                    try {
                        const element = document.getElementById(key);
                        if (element) {
                            element.innerHTML = yml[key];
                        }
                    } catch {
                        console.log("Unknown id and value: " + key + "," + yml[key].toString())
                    }
                });
            } else {
                console.log("Failed to parse YAML or empty config file");
            }
        })
        .catch(error => console.log(error));


    // Marked
    marked.use({ mangle: false, headerIds: false })
    section_names.forEach((name, idx) => {
        fetch(content_dir + name + '.md')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(markdown => {
                if (!markdown || markdown.trim() === '') {
                    console.log(`Empty or null markdown content for ${name}.md`);
                    return;
                }
                const html = marked.parse(markdown);
                const element = document.getElementById(name + '-md');
                if (element) {
                    element.innerHTML = html;
                }
            }).then(() => {
                // MathJax
                if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
                    MathJax.typesetPromise().catch((err) => console.log('MathJax error:', err));
                } else if (typeof MathJax !== 'undefined' && MathJax.typeset) {
                    try {
                        MathJax.typeset();
                    } catch (e) {
                        console.log('MathJax typeset error:', e);
                    }
                }
            })
            .catch(error => console.log(`Error loading ${name}.md:`, error));
    })

}); 
