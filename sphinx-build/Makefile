# Minimal makefile for Sphinx documentation
#

# You can set these variables from the command line, and also
# from the environment for the first two.
SPHINXOPTS    ?=
SPHINXBUILD   := sphinx-build
SOURCEDIR     := source
BUILDDIR      := build
DOCS_DIR      := ../docs

# Put it first so that "make" without argument is like "make help".
help:
	@$(SPHINXBUILD) -M help "$(SOURCEDIR)" "$(BUILDDIR)" $(SPHINXOPTS) $(O)

.PHONY: help Makefile

# Catch-all target: route all unknown targets to Sphinx using the new
# "make mode" option.  $(O) is meant as a shortcut for $(SPHINXOPTS).
%: Makefile
	@$(SPHINXBUILD) -M $@ "$(SOURCEDIR)" "$(BUILDDIR)" $(SPHINXOPTS) $(O)

# Clean build directory
.PHONY: clean
clean:
	@echo "Cleaning build directory..."
	@rm -rf $(BUILDDIR)
	@echo "Done."

# Build HTML documentation
.PHONY: html
html:
	@echo "Building HTML documentation..."
	@$(SPHINXBUILD) -b html $(SOURCEDIR) $(BUILDDIR)/html
	@echo "Done. Output is in $(BUILDDIR)/html"

# Clean and build HTML
.PHONY: all
all: clean html
	@echo "Documentation build complete."

# Copy built HTML to docs directory for GitHub Pages
.PHONY: pages
pages: all
	@echo "Copying documentation to docs directory..."
	@rm -rf $(DOCS_DIR)/*
	@mkdir -p $(DOCS_DIR)
	@cp -r $(BUILDDIR)/html/* $(DOCS_DIR)/
	@echo "Done. GitHub Pages content is in $(DOCS_DIR)"