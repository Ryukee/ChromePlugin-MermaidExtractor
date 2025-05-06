## Add to Chrome
open chrome://extensions/

click "load unpacked extension"

![image](https://github.com/user-attachments/assets/41257e46-0056-412d-a326-b996ed9d817d)


## Test
https://deepwiki.com/unrealengine47/UnrealEngine4/3.1-engine-initialization
![image](https://github.com/user-attachments/assets/7f60fe9c-605d-4997-84bb-b9d273caf8e9)

Result:
```mermaid
flowchart TD
    Start["UEditorEngine::Init()"] --> BaseInit["UEngine::Init()"]
    BaseInit --> SelectionSets["Initialize Selection Sets"]
    SelectionSets --> LoadEditorModules["Load Editor Modules"]
    LoadEditorModules --> SetupActorFactories["Setup Actor Factories"]
    SetupActorFactories --> ApplyUserSettings["Apply User Settings"]
    ApplyUserSettings --> RegisterDelegates["Register Editor Delegates"]
    RegisterDelegates --> InitComplete["Editor Initialization Complete"]
```

