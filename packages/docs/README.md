# Doc Folder
This folder contains the documentation for ProjectIt. 

The documentation is written using Asciidoc for the documents,
and draw.io for the pictures and diagrams.

# Installing the documentation tools

The documentation uses jekyll to generate the documentation site.

- Install [Jekyll](https://jekyllrb.com/docs/installation/):

  - install Ruby with devkit from [Ruby Installer](https://rubyinstaller.org/downloads/) on your system
  - install jekyll in your IDE: `gem install jekyll`
  - install jekyll-asciidoc: [webpage](https://github.com/asciidoctor/jekyll-asciidoc) `gem install jekyll-asciidoc`
  - Install ruby bundler: `gem install bundle`
  - Install just-the-docs template:  `bundle`
  - Run bundle init: `bundle init`
  - Run bundle from /packages/docs/ to update everything:  `bundle`
  - start jekyll from /packages/docs:  `jekyll serve`
