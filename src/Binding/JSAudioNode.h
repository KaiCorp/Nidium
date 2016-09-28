/*
   Copyright 2016 Nidium Inc. All rights reserved.
   Use of this source code is governed by a MIT license
   that can be found in the LICENSE file.
*/

#ifndef binding_jsaudionode_h__
#define binding_jsaudionode_h__

#include "AV/Audio.h"
#include "AV/AudioNode.h"
#include "Binding/JSAV.h"
#include "Binding/JSAudioContext.h"
#include "Binding/ClassMapper.h"

using namespace Nidium::AV;
using Nidium::AV::NodeEvent;

namespace Nidium {
namespace Binding {

class JSAudio;

static bool nidium_audionode_custom_assign_seek(JSContext *cx,
                                                unsigned argc,
                                                JS::Value *vp);
static bool nidium_audionode_custom_source_play(JSContext *cx,
                                                unsigned argc,
                                                JS::Value *vp);
static bool nidium_audionode_custom_source_pause(JSContext *cx,
                                                 unsigned argc,
                                                 JS::Value *vp);
static bool nidium_audionode_custom_source_stop(JSContext *cx,
                                                unsigned argc,
                                                JS::Value *vp);
static JSFunctionSpec AudioNodeCustomSource_funcs[] = {
    JS_FN("play", nidium_audionode_custom_source_play, 0, NIDIUM_JS_FNPROPS),
    JS_FN("pause", nidium_audionode_custom_source_pause, 0, NIDIUM_JS_FNPROPS),
    JS_FN("stop", nidium_audionode_custom_source_stop, 0, NIDIUM_JS_FNPROPS),
    JS_FN("assignSeek",
          nidium_audionode_custom_assign_seek,
          1,
          NIDIUM_JS_FNPROPS),
    JS_FS_END
};


static JSClass AudioNodeLink_class = { "AudioNodeLink",
                                       JSCLASS_HAS_PRIVATE,
                                       JS_PropertyStub,
                                       JS_DeletePropertyStub,
                                       JS_PropertyStub,
                                       JS_StrictPropertyStub,
                                       JS_EnumerateStub,
                                       JS_ResolveStub,
                                       JS_ConvertStub,
                                       nullptr,
                                       nullptr,
                                       nullptr,
                                       nullptr,
                                       nullptr,
                                       JSCLASS_NO_INTERNAL_MEMBERS };

static bool nidium_audionode_custom_set(JSContext *cx, unsigned argc,
                                                    JS::Value *vp);
static bool nidium_audionode_custom_assign_processor(JSContext *cx,
                                                     unsigned argc,
                                                     JS::Value *vp);
static bool nidium_audionode_custom_assign_init(JSContext *cx,
                                                unsigned argc,
                                                JS::Value *vp);
static bool nidium_audionode_custom_assign_setter(JSContext *cx,
                                                  unsigned argc,
                                                  JS::Value *vp);
// static bool nidium_audionode_custom_get(JSContext *cx, unsigned argc,
// JS::Value *vp);

JSFunctionSpec AudioNodeCustom_funcs[]
    = { JS_FN("set", nidium_audionode_custom_set, 2, NIDIUM_JS_FNPROPS),
        JS_FN("assignProcessor",
              nidium_audionode_custom_assign_processor,
              1,
              NIDIUM_JS_FNPROPS),
        JS_FN("assignInit",
              nidium_audionode_custom_assign_init,
              1,
              NIDIUM_JS_FNPROPS),
        JS_FN("assignSetter",
              nidium_audionode_custom_assign_setter,
              1,
              NIDIUM_JS_FNPROPS),
        // JS_FN("get", nidium_audionode_custom_get, 1, NIDIUM_JS_FNPROPS),
        JS_FS_END
    };

bool nidium_audionode_source_prop_setter(JSContext *cx,
                                                JS::HandleObject obj,
                                                uint8_t id,
                                                bool strict,
                                                JS::MutableHandleValue vp);
bool nidium_audionode_source_prop_getter(JSContext *cx,
                                                JS::HandleObject obj,
                                                uint8_t id,
                                                JS::MutableHandleValue vp);
bool nidium_audionode_custom_source_position_setter(JSContext *cx,
                                                           unsigned argc,
                                                           JS::Value *vp);
bool nidium_audionode_custom_source_position_getter(JSContext *cx,
                                                           unsigned argc,
                                                           JS::Value *vp);


static JSPropertySpec AudioNodeSource_props[] = {
    NIDIUM_JS_PSGS("position",
                   SOURCE_PROP_POSITION,
                   nidium_audionode_source_prop_getter,
                   nidium_audionode_source_prop_setter),

    NIDIUM_JS_PSG(
        "duration", SOURCE_PROP_DURATION, nidium_audionode_source_prop_getter),
    NIDIUM_JS_PSG(
        "metadata", SOURCE_PROP_METADATA, nidium_audionode_source_prop_getter),
    NIDIUM_JS_PSG(
        "bitrate", SOURCE_PROP_BITRATE, nidium_audionode_source_prop_getter),
    JS_PS_END
};


bool nidium_audionode_source_open(JSContext *cx, unsigned argc, JS::Value *vp);
bool nidium_audionode_source_play(JSContext *cx, unsigned argc, JS::Value *vp);
bool nidium_audionode_source_pause(JSContext *cx, unsigned argc, JS::Value *vp);
bool nidium_audionode_source_stop(JSContext *cx, unsigned argc, JS::Value *vp);
bool nidium_audionode_source_close(JSContext *cx, unsigned argc, JS::Value *vp);


JSFunctionSpec AudioNodeSource_funcs[]
    = { JS_FN("open", nidium_audionode_source_open, 1, NIDIUM_JS_FNPROPS),
        JS_FN("play", nidium_audionode_source_play, 0, NIDIUM_JS_FNPROPS),
        JS_FN("pause", nidium_audionode_source_pause, 0, NIDIUM_JS_FNPROPS),
        JS_FN("stop", nidium_audionode_source_stop, 0, NIDIUM_JS_FNPROPS),
        JS_FN("close", nidium_audionode_source_close, 0, NIDIUM_JS_FNPROPS),
        JS_FS_END
 };

class JSAudioNode : public ClassMapperWithEvents<JSAudioNode>, public Core::Messages
{
public:
    JSAudioNode(Audio::Node type, int in, int out, JSAudioContext *audio);
    JSAudioNode(Audio::Node type, AudioNode *node, JSAudioContext *audio);
    ~JSAudioNode();

    struct Message
    {
        JSAudioNode *jsNode;
        char *name;
        struct
        {
            uint64_t *datap;
            size_t nbytes;
        } clone;
    };

    enum TransferableFunction
    {
        PROCESS_FN,
        SETTER_FN,
        INIT_FN,
        SEEK_FN,
        END_FN
    };

    // Common
    NidiumJS *m_nJs;
    JSAudioContext *m_AudioContext;
    AudioNode *m_Node;
    Audio::Node m_NodeType;

    // Custom m_Node
    JSTransferableFunction *m_TransferableFuncs[END_FN];
    static void CustomCallback(const struct NodeEvent *ev);
    static void SetPropCallback(AudioNode *node, void *custom);
    static void ShutdownCallback(AudioNode *node, void *custom);
    static void InitCustomObject(AudioNode *node, void *custom);
    static void DeleteTransferableFunc(AudioNode *node, void *custom);
    bool createHashObj();

    JS::PersistentRootedObject *m_NodeObj;
    JS::PersistentRootedObject *m_HashObj;

    NIDIUM_PTHREAD_VAR_DECL(m_ShutdownWait)

    // Source m_Node
    void *m_ArrayContent;
    void onMessage(const Core::SharedMessages::Message &msg);
    static void onEvent(const struct AVSourceEvent *cev);

    // Custom source m_Node
    static void
    SeekCallback(AudioSourceCustom *node, double seekTime, void *custom);
    static bool PropSetter(JSAudioNode *node,
                           JSContext *cx,
                           uint8_t id,
                           JS::MutableHandleValue vp);

    static void RegisterObject(JSContext *cx);
    static JSPropertySpec *ListProperties();
    static JSFunctionSpec *ListMethods();

     NIDIUM_DECL_JSCALL(set);
     NIDIUM_DECL_JSCALL(get);
private:
    void add();
    bool m_IsDestructing;
};

} // namespace Binding
} // namespace Nidium



#endif
