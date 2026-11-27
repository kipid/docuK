// English (only the few Korean fragments are localized; the rest is already English)
module.exports = {
  code: 'en',
  partial: true,
  title: '# pure SEE.en',
  identifier: 'pure-SEE.en',
  desc:
    "pure SEE (Super Easy Edit) of docuK (Markdown): Manual | Documentation | Tutorial. This is an HTML document format named docuK which is rendered by JavaScript, jQuery, MathJax, and google code prettifier. Specific features are * Changable mode, font-family. * Resizable font-size, line-height. * Table of contents. * Numbering of sections/figures/equations. * Citing references in bubble-shape pop up. * Refering figures and equations. * Refering anything with id and element with class='number'. * Delayed(lazy)-loading of figures (images, iframes). * Delayed(lazy)-rendering of maths (MathJax). From 2023-06-01, MathJax is updated to render all equations in docuK or SEE (Super Easy Edit) in the beginning. * Auto code printing. Quite similar to LaTeX or Wiki document, but extended a little bit.",
  lines: {
    '34': `<a download target="_blank" href="https://tistory1.daumcdn.net/tistory/1468360/skin/images/pure%20SEE%20copiable.html?ETag=2025-06-30">Open pure-SEE-copiable.html</a> is recommended, and <a href="https://tistory1.daumcdn.net/tistory/1468360/skin/images/pure%20SEE%20copiable.html?ETag=2025-06-30" download="pure-SEE-copiable.html">Download pure-SEE-copiable.html (right click -&gt; Save link as)</a>, then copy and paste it to a new html file, and edit it with referencing and learning the SEE document.`,
    '45': '<li>2026-10-08 : docuK-prism.css modified. So that it is expressed colorfully even in dark mode.</li>',
    '46': '<li>2026-03-05 : New updates coming soon.</li>',
    '47-49': `<li>2026-02-12 : Make codes to be pretty-printed print beautifully as default lang-html even without a lang input.<br/>
+ Make Citing/Refering look pretty in bright mode.<br/>
+ Make <code class="prettyprint lang-html">&lt;pre class="prettyprint scrollable lang-java"&gt;&lt;/pre&gt;</code> pretty-printed properly as well. A bug appeared after changing the code prettifier in the middle.</li>`,
    '365': '\t\t// There are many editors of this kind, but TeX/LaTeX might be the origin (?) of them. However, it was made for books and papers, and it gives results like pdf, so it may look unsuitable for use on the internet and IT devices.<br>',
    '366': '\t\t// Still, its grammar is good to borrow and use.</li>',
    '480': 'Product\tOffline store (Samsung Store) price\tInstallment',
    '481': 'Galaxy Watch 8 40mm LTE\t385,000 KRW\tSamsung Card 36 months interest-free installment',
    '482': 'Galaxy Watch 8 Classic 44mm Bluetooth\t469,000 KRW\tSamsung Card 36 months interest-free installment',
    '483': 'Galaxy Watch 8 2025 47mm\t669,000 KRW\tSamsung Card 36 months interest-free installment',
    '470-473': `Product\tOffline store (Samsung Store) price\tInstallment\nGalaxy Watch 8 40mm LTE\t385,000 KRW\tSamsung Card 36 months interest-free installment\nGalaxy Watch 8 Classic 44mm Bluetooth\t469,000 KRW\tSamsung Card 36 months interest-free installment\nGalaxy Watch 8 2025 47mm\t669,000 KRW\tSamsung Card 36 months interest-free installment`,
    '364': '\t<li id="ref-latex"><a href="https://kipid.tistory.com/entry/introducing-LaTeX-and-Guides">Introduction to LaTeX(LaTeX, LayTeX) and guides(Guide)</a>, 2014-03-24<br>',
    '606': '// Regular expression to find the ETag pattern',
    '609': '// Function that reads a file and updates its ETag',
    '612': '        // Read the file',
    '615': '        // Update the ETag with the current date',
    '616': "        const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format",
    '619': '        // Write to the file only when there are changes',
    '631': '// Function that walks a directory recursively and processes its files',
    '641': '                // If it is a directory, process it recursively',
    '644': '                // If it is a file, update its ETag',
    '653': '// Main function',
    '655': "    const targetDirectory = process.argv[2] || '.'; // Directory given as a command-line argument; default is the current directory",
    '667': '// Call main only when the script is run directly',
  },
};
