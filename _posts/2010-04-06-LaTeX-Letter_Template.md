---
layout: post
title: LaTeX Letter Template
subtitle: Simple and clean
categories: latex
---
I'm looking for a job for next year to get out of university for a while.

That means I've been writing a lot of letters of introduction lately. To streamline this, I created a custom LaTeX document class called personal_letter.

The class looks as follows:


    %
    %	personal_letter
    %
    %	Created by Thomas Loven on 2010-02-24.
    %	Feel free to use.
    %
    
    \ProvidesClass{personal_letter}
    
    % Based on article
    \LoadClass[a4paper, oneside]{article}
    
    \usepackage{ifthen}
    % Define functions for user changeable variables
    \makeatletter
	    \newcommand{\adress}[1]{\def \@adress{#1}}
	    \newcommand{\telephone}[1]{\def \@telephone{#1}}
	    \newcommand{\email}[1]{\def \@email{#1}}
	    \newcommand{\name}[1]{\def \@name{#1}}
	    \newcommand{\place}[1]{\def \@place{#1}}
	    %\newcommand{\date}[1]{\def \@date{#1}}
	    \newcommand{\greeting}[1]{\def \@greeting{#1}}
	    \newcommand{\closing}[1]{\def \@closing{#1}}
	    \newcommand{\url}[1]{\def \@url{#1}}
	    \adress{}
	    \telephone{}
	    \email{}
	    \name{}
	    \place{}
	    \date{}
	    \greeting{}
	    \closing{}
	    \url{}
    \makeatother
    

    % Include usefull packages
    \usepackage[utf8]{inputenc}
    \usepackage{fullpage}
    \usepackage{fancyhdr}
    \usepackage{setspace}
    \usepackage[swedish]{babel}
    \usepackage{longtable}
    % Make graphics work with pdf or dvi files
    \usepackage{ifpdf}
    \ifpdf
    \usepackage[pdftex]{graphicx}
    \DeclareGraphicsExtensions{.pdf, .jpg, .tif}
    \else
    \usepackage{graphicx}
    \DeclareGraphicsExtensions{.eps, .jpg}
    \fi
    
    
    % Costruct heading
    \makeatletter
	    \fancyfoot[LO, LE]{\@adress}
	    \fancyfoot[RO, RE]{
	    \ifthenelse{\equal{\@telephone}{}}{}{
		    \@telephone \\ \@email \\ \@url
	    }}
	    \fancyfoot[C]{}
	    \setlength{\headheight}{0 cm}
	    \setlength{\headsep}{0 cm}
	    \renewcommand{\headrulewidth}{0pt}
	    \addtolength{\textheight}{0 cm}
	    \renewcommand{\footrulewidth}{0.5pt}
	    \pagestyle{fancy}
    \makeatletter

    %Body of the letter
    \makeatletter
	    \newenvironment{body}%
	    {
		    \begin{quotation}
		    \begin{onehalfspace}
		    \setlength{\parskip}{1ex}
		
		    \ifthenelse{\equal{\@place}{}}{}{
			    \begin{flushright} \@place\\
			    \@date
			    \end{flushright}
		    }
		
		    \vspace{2ex}
		    \bf \noindent \@greeting
		    \rm
	    }%
	    {
		    \vspace{10pt}
		    \ifthenelse{\equal{\@closing}{}}{}{
			    \noindent \@closing \\
			    \noindent \@name
		    }
		    \end{onehalfspace}
		    \end{quotation}
	    }
    \makeatother

    \newcommand{\titel}[1]{
    \begin{centering}
    {\Huge #1}
    \end{centering}
    }

    \newcommand{\rubrik}[1]{
    \vspace{1.5em}

    {\large \bf #1}


    }
{: .prettyprint .lang-tex}

Plain and simple.

And a usage example:

    \documentclass{personal_letter}

    \name{Thomas Lovén}
    \place{Göteborg}
    \date{6 april 2010}
    \adress{Thomas Lovén \\ Xxxxxxxxxxxxxxx XX \\ XXX XX Xxxxxx Xxxxxxxx}
    \telephone{+XX XX XXX XX XX}
    \email{thomasloven@gmail.com}
    \url{thomasloven.wordpress.com}

    \begin{document}

    \greeting{Salvete!}
    \closing{Di vos incolumes custodiant.}

    \begin{body}

        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam non arcu non massa accumsan tincidunt. Suspendisse non est quis massa sollicitudin faucibus. Quisque gravida vulputate nisi pharetra ultrices. Fusce tincidunt ante quis lacus adipiscing eget dictum justo luctus. Vivamus nec tempus diam. Vivamus rhoncus varius arcu, et vulputate purus aliquam eget. Cras eget suscipit lectus. Donec nec nulla ac urna ultricies bibendum sed vitae nibh. Suspendisse consectetur luctus quam eget vulputate. Pellentesque et nisl et quam vestibulum auctor quis et metus. Sed cursus tellus at felis lobortis ut tincidunt purus porttitor.

        Donec gravida metus eu dui rutrum nec bibendum libero molestie. Aenean et odio massa. Donec pulvinar augue non tellus vulputate nec congue justo accumsan. Nam pretium sagittis dictum. Sed semper auctor neque in commodo. Mauris dignissim ante ac nibh pretium consequat. Donec orci tortor, pharetra non congue vel, ultrices sit amet lacus. Suspendisse a lacus nec ante venenatis bibendum vitae id dui. Nam semper arcu facilisis nunc euismod volutpat. Donec accumsan velit nec ante lacinia pulvinar. Phasellus ut varius enim. Pellentesque vel augue odio. Suspendisse sed nisi vel magna euismod semper. Maecenas erat neque, tristique id consequat id, mollis eu enim. Phasellus laoreet pulvinar ante accumsan posuere. Proin viverra dui id ipsum hendrerit non mollis mi rutrum.

    \end{body}

    \end{document}
{: .prettyprint .lang-tex}

![Sample](/media/img/provbrev.jpg)
