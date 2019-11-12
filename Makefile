mocha=./node_modules/mocha/bin/mocha --recursive
folders=models lib e2e
dirs=$(addprefix tests/,$(folders))
.PHONY: test $(folders) cover
test: $(folders)
models:
	@$(mocha) tests/models

lib:
	@$(mocha) tests/lib

externalCalls:
	@$(mocha) tests/externalCalls

activity:
	@$(mocha) tests/activity

e2e:
	@$(mocha) tests/e2e

#http://stackoverflow.com/questions/6273608/how-to-pass-argument-to-makefile-from-command-line
custom:
	@$(mocha) $(filter-out $@,$(MAKECMDGOALS))

%:
	@:

cover:
	./node_modules/istanbul/lib/cli.js cover node_modules/mocha/bin/_mocha -- --recursive $(dirs)

jenkins:
	@$(mocha) --reporter mocha-jenkins-reporter --colors --reporter-options junit_report_path=./test-reports/report.xml $(dirs)