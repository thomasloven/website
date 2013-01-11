
PR.registerLangHandler(
    PR.createSimpleLexer(
        [
         // A line comment that starts with ;
        [PR.PR_COMMENT, /^;[^\r\n]*/, null, ';'],
         // Whitespace
         [PR.PR_PLAIN,   /^[\t\n\r \xA0]+/, null, '\t\n\r \xA0']
        ],
	 [
         [PR.PR_KEYWORD, /^\[[\w\s]+\]/],
	 [PR.PR_KEYWORD, /^\%\w+/],
	 [PR.PR_KEYWORD,
          /[0-9]+(,5)?hp/],
	 [PR.PR_TYPE,
          /^[A-Z]{3,4}[0-9]{2,3}/],
         [PR.PR_LITERAL, /^0x[0-9A-F]*/]
	 
        ]),
    ['betyg']);
