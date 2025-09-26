# ios/pod_pre.rb
begin
  require 'xcodeproj'
  module Xcodeproj
    module Constants
      PROJECT_OBJECT_VERSION_TO_COMPATIBILITY_VERSION[70] ||= 'Xcode 16.0'
      COMPATIBILITY_VERSION_TO_PROJECT_OBJECT_VERSION['Xcode 16.0'] ||= 70
      if defined?(LAST_KNOWN_OBJECT_VERSION)
        const_set(:LAST_KNOWN_OBJECT_VERSION, [LAST_KNOWN_OBJECT_VERSION, 70].max)
      end
    end
  end
rescue => e
  warn "pod_pre.rb: xcodeproj 70 patch skipped: #{e}"
end
