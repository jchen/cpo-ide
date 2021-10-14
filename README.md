# CPO-IDE
A Chrome extension that extends CPO ([code.pyret.org](https://code.pyret.org)) features. It currently works on `code.pyret.org` and `pyret.cs.brown.edu`. 

As of right now, this is a bunch of pretty messy Javascript code written in one afternoon (on a fateful day)... Contributers are welcome (please)! 

# Features
Here's the current limited set of features: 

## Function Tooltips
Function names can be detected (those whose definition lines start with `fun`). When said function is used/called, the function header and docstring will be displayed in a tooltip. This only works in the same file (although in Examplar, it kinda works across all 3 files). 

## Style
This project started as a small checkstyle script in Python - so most features are style guides (taken from cs19's style guidelines). Here's what we have and don't have: 
 - [x] poor-indent
   - CPO takes care of that for us
 - [ ] lines-over-100
   - **WIP**
 - [ ] no-cases
   - Requires knowledge of semantics of code
 - [x] poor-names
   - Can currently detect single-char names, camelCase, and snake_case.
   - Very buggy right now, things like `f` and `r` get flagged, so does `StringDict`. 
 - [x] type-any
   - Detects for untyped `List` and `Any`.
 - [ ] need-ask-block
   - **WIP**
 - [ ] if-for-bool
   - Requires parsing. 
 - [ ] cases-with-deref
   - Requires parsing. 
 - [ ] bad-function-nesting
   - Subjective. 
 - [ ] bad-commenting
   - Subjective. 
 - [ ] excessive-indexing
   - **WIP** 
 - [ ] dangerous-defaults
   - Subjective, requires manual checking. 
 - [x] poor-documentation
   - Flags missing docstrings. 
 - [ ] types-missing
   - WIP. 
 - [x] check-strings-missing
   - Flags missing checkstrings. 
 - [ ] needs-spacing/extra-spacing
   - Subjective. 
 - [ ] using else for cases
   - Requires parsing. 
 - [ ] excessive-documentation
   - Subjective. 
 - [ ] magic-numbers
   - Requires manual checking. 
 - [ ] extraneous-code
   - We _could_ do it, but do we want errors on every "function unused"? Functions could also be exported too is the thing.  

# Installation
For now, in `chrome://extensions`, enable 'Developer Mode' and load this folder as an Unpacked extension. At some point hopefully it can go on the Chrome Extension Store. 
