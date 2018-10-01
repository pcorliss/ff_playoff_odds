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
