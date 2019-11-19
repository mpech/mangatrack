mocha=./node_modules/mocha/bin/mocha --recursive
folders=models lib activity importers services formatters e2e
dirs=$(addprefix test/,$(folders))

#allow makefile to be run without npm
ifeq ($(INIT_CWD),)
	INIT_CWD := $(PWD)
endif
.PHONY: test $(folders) cover
test: $(folders)
models:
	@$(mocha) test/models

lib:
	@$(mocha) test/lib

externalCalls:
	@$(mocha) test/externalCalls

importers:
	@$(mocha) test/importers

services:
	@$(mocha) test/services

activity:
	@$(mocha) test/activity

formatters:
	@$(mocha) test/formatters

e2e:
	@$(mocha) test/e2e

#http://stackoverflow.com/questions/6273608/how-to-pass-argument-to-makefile-from-command-line
custom:
	$(mocha) $(addprefix $(INIT_CWD)/,$(filter-out custom, $(MAKECMDGOALS)));

%:
	@:

cover:
	./node_modules/istanbul/lib/cli.js cover node_modules/mocha/bin/_mocha -- --recursive $(dirs)
