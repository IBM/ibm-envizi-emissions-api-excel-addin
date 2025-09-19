# Configuration file for the Sphinx documentation builder.
#
# For the full list of built-in configuration values, see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Project information -----------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#project-information

project = 'IBM Envizi Emissions API Excel Add-in'
copyright = '2025, IBM Corporation'
author = 'Ridham Thumar'
release = '1.0.0'

# -- General configuration ---------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#general-configuration
import os
import sys
sys.path.insert(0, os.path.abspath('../..'))

# Language used for content
language = 'en'

# Source file suffix
source_suffix = {
    '.rst': 'restructuredtext',
}

# The master document
master_doc = 'index'

extensions = [
    'sphinx.ext.autodoc',
    'sphinx.ext.viewcode'
]

templates_path = ['_templates']
exclude_patterns = []



# -- Options for HTML output -------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#options-for-html-output

html_theme = 'furo'
html_static_path = ['_static', '_images']

# Add CSS to improve notebook appearance
html_css_files = [
    'custom.css',
]