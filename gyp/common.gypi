# Copyright 2016 Nidium Inc. All rights reserved.
# Use of this source code is governed by a MIT license
# that can be found in the LICENSE file.

{
    'includes': ["../src/libapenetwork/gyp/common.gypi"],
    'target_defaults': {
        'default_configuration': 'Release',
        'defines': [
            'NIDIUM_VERSION_STR="<(nidium_version)"',
            'NIDIUM_BUILD="<!@(git rev-parse HEAD)"',
            'NIDIUM_PLATFORM="<(target_os)"',
            '<(nidium_product_define)'
            #'UINT32_MAX=4294967295u',
            #'_FILE_OFFSET_BITS=64',
            #'_HAVE_SSL_SUPPORT'
        ],
        'ldflags': [
            '-L<(nidium_output_third_party_path)',
        ],
        'msvs_settings': {
            'VCLinkerTool': {
                'LinkTimeCodeGeneration': 0,
                'SuppressStartupBanner': 'true',
                'LinkIncremental': 0,
                "AdditionalLibraryDirectories": [
                    "<(libapenetwork_output_third_party_path)",
                    "<(nidium_output_third_party_path)"
                ],
                'AdditionalOptions': [
                    '/IGNORE:4049,4099,4217',
                ],
            },
            'VCCLCompilerTool': {
                'ExceptionHandling': 0,
                'AdditionalOptions': [
                    "/EHsc",
                    "-wd4067",
                 ],
            },
        },
        'xcode_settings': {
            "OTHER_LDFLAGS": [
                # Because of an issue with gyp & xcode we need to hardcode this path : 
                # - On OSX xcodeproj files are generated inside the gyp/ directory of the gyp file called. 
                #     Settings --generator-output flag does not have any effect. XCode will "cd" inside 
                #     the directory of the xcodeproj file (this is problematic when building libapenetwork unit-tests)
                # - On Linux Makefie are generated inside the build/ directory at the root of the repo no mater what.
                '-L<(DEPTH)/build/third-party',
                #'-L<(nidium_output_third_party_path)',
            ],
	},
        'configurations': {
            'Debug': {
                'defines': ['NIDIUM_DEBUG', 'DEBUG', '_DEBUG'],
            },
            'Release': {
                'defines': [ 'NDEBUG'],
            }
        },

        'conditions': [
            ['nidium_enable_breakpad==1', {
                'defines': [ 'NIDIUM_ENABLE_CRASHREPORTER' ],
            }],
            # XXX : Remove me once we switched to .nfs file for privates
            ['nidium_package_embed==1', {
                'defines': [
                    'NIDIUM_EMBED_FILE="<(nidium_embed_bin_header)"',
                    'NIDIUM_PACKAGE_EMBED',
                ]
            }],
            ['profiler==1', {
                'defines': [
                    'NIDIUM_PROFILER',
                ],
                'ldflags': [
                    '-lprofiler'
                ],
                'xcode_settings': {
                    "OTHER_LDFLAGS": [
                        '-fsanitize=address'
                    ],
                }
            }],
        ],

        'target_conditions': [
            ['_type=="static_library"', {
                'standalone_static_library': 1, # disable thin archive
            }],
        ],
    }
}
