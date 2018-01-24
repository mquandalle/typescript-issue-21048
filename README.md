### Reproduction for https://github.com/Microsoft/TypeScript/issues/21048

```
npm install
npm start
```

The problem appears when the `@types/ramda` dependency is added to the project. Without it there is no Node error, but the following message :

```
Failed to compile.

./src/index.tsx
Module not found: Can't resolve 'ramda' in '/home/project/src'
```

This is expected because the `index.tsx` file is extracted from a larger project. But in the minimal issue reproduction the "failed to compile" basically means success.

However when the `@types/ramda` dependency is included the Node process doesn't display the "failed to compile" message and hang on for some time before running out of memory :

```
<--- Last few GCs --->

[10675:0x32a5460]    75618 ms: Mark-sweep 2059.7 (2118.8) -> 2059.6 (2102.8) MB, 2410.0 / 0.0 ms  (+ 0.0 ms in 0 steps since start of marking, biggest step 0.0 ms, walltime since start of marking 2410 ms) last resort GC in old space requested
[10675:0x32a5460]    77960 ms: Mark-sweep 2059.6 (2102.8) -> 2059.6 (2102.8) MB, 2341.5 / 0.0 ms  last resort GC in old space requested


<--- JS stacktrace --->

==== JS stack trace =========================================

Security context: 0x27bbc6aa5ee1 <JSObject>
    2: getTypeListId(aka getTypeListId) [/home/project/node_modules/typescript/lib/typescript.js:~29873] [pc=0x3db8ed7d8a31](this=0x1c409a702311 <undefined>,types=0x30ab28db29f1 <JSArray[4]>)
    3: /* anonymous */(aka /* anonymous */) [/home/project/node_modules/typescript/lib/typescript.js:~30588] [pc=0x3db8ed98673f](this=0x1c409a702311 <undefined>...

FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory
 1: node::Abort() [/home/maxime/.nvm/versions/node/v8.9.4/bin/node]
 2: 0x121a2cc [/home/maxime/.nvm/versions/node/v8.9.4/bin/node]
 3: v8::Utils::ReportOOMFailure(char const*, bool) [/home/maxime/.nvm/versions/node/v8.9.4/bin/node]
 4: v8::internal::V8::FatalProcessOutOfMemory(char const*, bool) [/home/maxime/.nvm/versions/node/v8.9.4/bin/node]
 5: v8::internal::Factory::NewRawOneByteString(int, v8::internal::PretenureFlag) [/home/maxime/.nvm/versions/node/v8.9.4/bin/node]
 6: v8::internal::Factory::NewStringFromOneByte(v8::internal::Vector<unsigned char const>, v8::internal::PretenureFlag) [/home/maxime/.nvm/versions/node/v8.9.4/bin/node]
 7: v8::internal::Factory::NumberToString(v8::internal::Handle<v8::internal::Object>, bool) [/home/maxime/.nvm/versions/node/v8.9.4/bin/node]
 8: v8::internal::Runtime_NumberToString(int, v8::internal::Object**, v8::internal::Isolate*) [/home/maxime/.nvm/versions/node/v8.9.4/bin/node]
 9: 0x3db8ed60463d
Type checking and linting aborted - probably out of memory. Check `memoryLimit` option in ForkTsCheckerWebpackPlugin configuration.
```
