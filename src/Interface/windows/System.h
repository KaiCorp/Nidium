/*
   Copyright 2017 Nidium Inc. All rights reserved.
   Use of this source code is governed by a MIT license
   that can be found in the LICENSE file.
*/

#ifndef interface_windows_system_h__
#define interface_windows_system_h__

#include <stdio.h>

#include <Port/MSWindows.h>
#include "SystemInterface.h"

namespace Nidium{
namespace Interface{

class System: public SystemInterface
{
public:
    System();
    ~System();
    float backingStorePixelRatio();
    void initSystemUI(HINSTANCE hInstance);
    const char* getCacheDirectory();
    const char* getEmbedDirectory();
    const char* getUserDirectory();
    const char* getLanguage();
    const char* cwd();
    void alert(const char *message, SystemInterface::AlertType type = SystemInterface::AlertType::ALERT_INFO);
    void sendNotification(const char *title, const char *content, bool sound);
    const char *execute(const char *cmd);
    void print(const char *buf);
private:
    bool m_SystemUIReady = false;
    char *m_EmbedPath = nullptr;
    char *m_UserDirectory = nullptr;
    FILE *m_LogF;
};

} // namespace Interface
} // namespace Nidium

#endif
