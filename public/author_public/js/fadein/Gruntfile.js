module.exports = function(grunt) {

	grunt.initConfig({

		// Import package manifest
		pkg: grunt.file.readJSON("package.json"),

		// Banner definitions
		meta: {
			banner: "/*\n" +
				" *  <%= pkg.title || pkg.name %> - v<%= pkg.version %>\n" +
				" *  <%= pkg.description %>\n" +
				" *  <%= pkg.homepage %>\n" +
				" *\n" +
				" *  Made by <%= pkg.author %>\n" +
				" */\n"
		},

		// Concat definitions
		concat: {
			dist: {
				src: ["src/jquery.fadeInAmate.js"],
				dest: "dist/jquery.fadeInAmate.js"
			},
			options: {
				banner: "<%= meta.banner %>"
			}
		},

		// Lint definitions
		jshint: {
			files: ["src/jquery.fadeInAmate.js"],
			options: {
				jshintrc: ".jshintrc"
			}
		},

		// Minify definitions
		uglify: {
			my_target: {
				src: ["dist/jquery.fadeInAmate.js"],
				dest: "dist/jquery.fadeInAmate.min.js"
			},
			options: {
				banner: "<%= meta.banner %>"
			}
		},

        web_server: {
            options: {
                cors: true,
                port: 8000,
                nevercache: true,
                logRequests: true
            },
            foo: 'bar' // For some reason an extra key with a non-object value is necessary
        },

		// CoffeeScript compilation
		coffee: {
			compile: {
				files: {
					"dist/jquery.fadeInAmate.js": "src/jquery.fadeInAmate.coffee"
				}
			}
		},

        watch: {
            scripts: {
                files: ['**/*.js'],
                tasks: ["jshint", "concat", "uglify", "web_server"],
                options: {
                    spawn: false,
                    reload: true
                }
            }
        }

	});

	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-coffee");
    grunt.loadNpmTasks('grunt-web-server');
    grunt.loadNpmTasks('grunt-contrib-watch');

//jshint
    grunt.registerTask("default", [  "jshint", "concat", "uglify", "web_server", "watch"]);
	grunt.registerTask("travis", ["jshint"]);

};
