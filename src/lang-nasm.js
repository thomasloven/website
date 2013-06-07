// Copyright (C) 2009 Onno Hommes.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


/**
 * @fileoverview
 * Registers a language handler for the AGC/AEA Assembly Language as described
 * at http://virtualagc.googlecode.com
 * <p>
 * This file could be used by goodle code to allow syntax highlight for
 * Virtual AGC SVN repository or if you don't want to commonize
 * the header for the agc/aea html assembly listing.
 *
 * @author ohommes@alumni.cmu.edu
 */

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
          /^\b(align|cli|sti|mov|equ|dd|dw|times|or|lgdt|xor|invlpg|add|pusha|push|call|jmp|popa|pop|int|ret)\b/],
	 [PR.PR_TYPE,
          /^\b(eax|ax|ah|al|ebx|bx|bh|bl|ecx|cx|ch|cl|edx|dx|dh|dl|esi|edi|ebp|eip|esp|eflags|cs|ds|es|fs|gs|ss|cr0|cr1|cr2|cr3|cr4)\b/],
         [PR.PR_LITERAL, /^0x[0-9A-F]*/],
	 [PR.PR_LITERAL, /^\d+/]
	 
        ]),
    ['nasm', 'asm', 'as', 's']);
