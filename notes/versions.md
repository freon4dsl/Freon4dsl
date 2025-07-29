# Versioning

For the migration scenario we need to be able to recognize versions of languages.

### Current situation

- Multiple .ast .edit .type .scope and .valid files

- Each .ast file may use a different language name
  
  - Used for LionWeb compatibility: allows concept/infaces etc. to "belong" to different languages.
  -  JSON storage uses these langages.

- No version defined in any file, except in LionWebstorage, per LionWeb language

- The freon-server has a version property for each model, which is not used yet.

### Needed:

- version for Freon overall language, how?:
  
  - Naming question: how do we call the "combined language" in Freon?
  - Version:
    - **propose:** One overall version (independent of number of "languages"), or
    - Version per language
      - probably not very usefull
      - nicely in line with LionWeb

### Specifying Options

Option 1: include version info in an .ast file

- Rather ad hoc
- Work to change grammar.
- Unclear where to find it when there are multiple .ast files 

Option 2: separate `freon.lang` file with overall language information, such as:

- Version
- Overall language name (is currently derived in an ad-hoc way)
- LionWeb Serialization version?
- Freon version? Is this applicable?
- Easy to enhance with other options, like 
  - the "use csss for indent" from Graham.
  - case sensitivity or not

Option 3: as option 2, but in a simple freon.config.json file

- No need for an extra parser, as we need in option 1
- This config file should not contain any language information, only meta-info.
  There should be no refrerences from/to the definition files.

Other options ???

## Code Changes

- generate 
  - overall name as language name in FreLanguage
  - overall version as ;language version in FreLanguage

- store the language name and version on the server
- match language name and version when reading from server
