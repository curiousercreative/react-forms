## @curiouser/react-forms documentation
### Goal
Our goal here is provide a resource for engineers to familiarize themselves
with reusable code that is likely to be useful (Components, libraries, util functions, etc).
We don't need to document absolutely everything, rather what's most likely to be
useful to other engineers on the team.

### Caveats
1. Documentation may not be up to date. If something isn't working as expected or
you are preparing to implement, double-check the source code.
1. Module exports may not import as this documentation suggests. Again, if something
isn't working as expected, check the source code.
1. Not everything is documented fully and some code isn't documented at all.

### Theme modifications
To better fit our codebase organization, some modifications were made to the JSDoc
template:
1. "Classes" was changed to "React Components" since we maybe have 0 classes that
aren't React Components.
1. "Namespaces" was changed to "Groups/Namespaces". We don't really use this as it's
meant to be used. Instead, we use this to broadly organize the documentation in a
similar manner to how the codebase is organized
