# A sample Guardfile
# More info at https://github.com/guard/guard#readme

## Uncomment and set this to only include directories you want to watch
# directories %w(app lib config test spec features) \
#  .select{|d| Dir.exists?(d) ? d : UI.warning("Directory #{d} does not exist")}

## Note: if you are using the `directories` clause above and you are not
## watching the project directory ('.'), then you will want to move
## the Guardfile to a watched dir and symlink it back, e.g.
#
#  $ mkdir config
#  $ mv Guardfile config/
#  $ ln -s config/Guardfile .
#
# and, you'll have to watch "config/Guardfile" instead of "Guardfile"

guard :bundler do
  require 'guard/bundler'
  require 'guard/bundler/verify'
  helper = Guard::Bundler::Verify.new

  files = ['Gemfile']
  files += Dir['*.gemspec'] if files.any? { |f| helper.uses_gemspec?(f) }

  # Assume files are symlinked from somewhere
  files.each { |file| watch(helper.real_path(file)) }
end

guard 'uglify', :input => 'public/js/deps.dev.js', :output => "public/js/deps.min.js" do
  watch 'public/js/deps.dev.js'
end

guard :shell do
  watch(%r{src/js/[^.][^/]+\.js}) do |m|
    out = `browserify src/js/bundle.js`
    out_file = "public/js/deps.dev.js"
    File.open(out_file, 'w') do |fh|
      fh.write out
    end
    "Browserify #{m[0]} -> #{out_file}"
  end
end

#guard :browserify do

#end

# Sample guardfile block for Guard::Haml
# You can use some options to change guard-haml configuration
# output: 'public'                   set output directory for compiled files
# input: 'src'                       set input directory with haml files
# run_at_start: true                 compile files when guard starts
# notifications: true                send notifictions to Growl/libnotify/Notifu
# haml_options: { ugly: true }    pass options to the Haml engine

#guard :haml, output: 'public', input: 'src', run_at_start: true
#
#
#browserify public/js/bundle.js > public/js/deps.dev.js
#browserify public/js/bundle.js | uglifyjs > public/js/deps.min.js
