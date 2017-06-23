# Copyright 2016 Nidium Inc. All rights reserved.
# Use of this source code is governed by a MIT license
# that can be found in the LICENSE file.

{
    'targets': [{
        'target_name': 'libnidiumcore-includes',
        'type': 'none',
        'direct_dependent_settings': {
            'include_dirs': [
                '<(third_party_path)/mozilla-central/js/src/obj/dist/include/',
                '<(third_party_path)/mozilla-central/js/src/',
                '<(third_party_path)/mozilla-central/nsprpub/dist/include/nspr/',
                '<(third_party_path)/http-parser/',
                '<(third_party_path)/jsoncpp/dist',
                '<(third_party_path)/rapidxml',
                '../src/',
            ],
            'defines': [
                #'_FILE_OFFSET_BITS=64',
                '__STDC_LIMIT_MACROS',
                'JSGC_USE_EXACT_ROOTING'
            ],
            'cflags': [
                '-fno-rtti',
                #'-fno-exceptions', # rapidxml use exception :/
                '-Wno-c++0x-extensions',

                '-ffunction-sections',
                '-fdata-sections',

                # Flags needed to silent some SM warning
                '-Wno-invalid-offsetof',
                '-Wno-mismatched-tags',

                # Include our own js-config.h so it is automatically
                # versioned for our build flavour
                '-include <(nidium_output_third_party_path)/js-config.h'
            ],

            'cflags_cc': [
                '-include ../src/Macros.h'
            ],

            'xcode_settings': {
                'OTHER_CFLAGS': [
                    '-fno-rtti',
                    #'-fno-exceptions', # rapidxml use exception :/
                    '-Wno-c++0x-extensions',
                    '-Wno-invalid-offsetof',
                    '-Wno-mismatched-tags',
                    '-include <(nidium_output_third_party_path)/js-config.h',
                ],
                'OTHER_CPLUSPLUSFLAGS': [ 
                    '$inherited',
                    '-include ../src/Macros.h'
                ],
            },
            'conditions': [
                ['nidium_product_define=="NIDIUM_PRODUCT_FRONTEND"', {
                    'include_dirs': [
                    '<(third_party_path)/skia/',
                    '<(third_party_path)/skia/include/core/',
                    '<(third_party_path)/skia/include/config/',
                ]}],
                ['nidium_leveldb==1', {
                    'include_dirs': [
                        '<(third_party_path)/leveldb/include/',
                    ],
                    'defines': [ 'NDM_LEVELDB_ENABLED' ],
                }],
                ['nidium_js_disable_window_global==1', {
                    'defines':[
                        'NIDIUM_DISABLE_WINDOW_GLOBAL'
                    ],
                }],
                ["target_os=='tvos' or target_os=='mac' or target_os=='ios'", {
                    "defines": ['DSO_EXTENSION=".dylib"'],
                }],
                ['target_os=="linux" or target_os=="android"', {
                    'defines': ['DSO_EXTENSION=".so"']
                }],
            ]},
        }, {
        'target_name': 'libnidiumcore-link',
        'type': 'none',
        'direct_dependent_settings': {
            'conditions': [
                ['target_os=="mac"', {
                    "link_settings": {
                        'libraries': [
                            'libhttp_parser.a',
                            'libjs_static.a',
                            'libnspr4.a',
                            'libmozglue.a',
                            'libleveldb.a',
                        ]
                    }
                }],
                ['target_os=="linux" or target_os=="android"', {
                    'ldflags': [
                        '-Wl,--gc-sections',
                    ],
                    "link_settings": {
                        'libraries': [
                            '-ljs_static',
                            '-lmozglue',
                            '-lnspr4',
                            '-lpthread',
                            '-lrt',
                            '-ldl',
                            '-lhttp_parser',
                            '-lleveldb',
                        ]
                    }
                }]
            ],
        },
    }, {
        'target_name': 'libnidiumcore',
        'type': 'static_library',
        'dependencies': [
            '<(nidium_network_path)/gyp/network.gyp:*',
            'libnidiumcore.gyp:libnidiumcore-includes',
        ],
        'sources': [
            '<(third_party_path)/jsoncpp/dist/jsoncpp.cpp',
            '../src/Net/HTTP.cpp',
            '../src/Net/HTTPParser.cpp',
            '../src/Net/HTTPServer.cpp',
            '../src/Net/HTTPStream.cpp',
            '../src/Net/WebSocket.cpp',
            '../src/Net/WebSocketClient.cpp',

            '../src/Binding/ThreadLocalContext.cpp',
            '../src/Binding/NidiumJS.cpp',
            '../src/Binding/JSGlobal.cpp',
            '../src/Binding/JSEvents.cpp',
            '../src/Binding/JSFile.cpp',
            '../src/Binding/JSHTTP.cpp',
            '../src/Binding/JSHTTPServer.cpp',
            '../src/Binding/JSModules.cpp',
            '../src/Binding/JSSocket.cpp',
            '../src/Binding/JSThread.cpp',
            '../src/Binding/JSDebug.cpp',
            '../src/Binding/JSDebugger.cpp',
            '../src/Binding/JSConsole.cpp',
            '../src/Binding/JSFS.cpp',
            '../src/Binding/JSNFS.cpp',
            '../src/Binding/JSProcess.cpp',
            '../src/Binding/JSUtils.cpp',
            '../src/Binding/JSStream.cpp',
            '../src/Binding/JSWebSocket.cpp',
            '../src/Binding/JSWebSocketClient.cpp',
            '../src/Binding/JSOS.cpp',
            '../src/Binding/JSVM.cpp',

            '../src/Core/SharedMessages.cpp',
            '../src/Core/Utils.cpp',
            '../src/Core/Messages.cpp',
            '../src/Core/TaskManager.cpp',
            '../src/Core/Path.cpp',
            '../src/Core/Context.cpp',

            '../src/IO/File.cpp',
            '../src/IO/Stream.cpp',
            '../src/IO/FileStream.cpp',
            '../src/IO/NFSStream.cpp',
            '../src/IO/NFS.cpp',
        ],
        'conditions': [
            ['nidium_leveldb==1', {
                'sources': [
                    '<(nidium_src_path)/Core/DB.cpp',
                    '<(nidium_src_path)/Binding/JSDB.cpp',
                ],
            }],
        ],
    }],
}
