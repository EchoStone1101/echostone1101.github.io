---
draft: false
---
This is a post of my take on writing academic conference papers, specifically as a PhD in the field of computer science. This is not:

- Paper writing 101. I don't plan to cover the basics of LaTeX, or tell you what sections should generally be in a paper. Better sources for these exist out there.
- Paper writing master class. I'm not a master in paper writing - even Charles Berthoud[^1] hasn't been on the master class for bass!

Instead, this is a list of my personal dos and don'ts that I find myself coming back to repeatedly when I write or edit my own papers. I figured it might be worth it to explicitly note them down, as my younger self would probably find some of these suggestions helpful. Likewise, I imagine this post to be the most interesting for other early-year PhDs out there who have just started writing their first paper - or, *no offense*, who have just gotten their first rejection and are feeling a bit sad. *No worries, we've all been there!*

So, without further ado, and in no particular order -

---
# General Checklists

These advice should apply to academic writing in general, and I always check for them myself.

1. Explain all your abbreviations at least once, unless it is really, *really* well-known (e.g., CPU, GPU, or AI). It's always "large language models (LLMs)" and "service-level objectives (SLOs)" in the introduction, and perhaps also in the background section.

2. If you made up names for your approach, techniques, or any other concepts, do not use them before their definitions. Yes, your paper should be more limited than a C program, because human readers are (quite understandably) less successful compilers.

3. "e.g.", "i.e.", and the like require a trailing comma `,` (*i.e.***,**  like this). To never mess this up, I always have them defined as macros, *e.g.***,** `\newcommand{\eg}{\emph{e.g.,}\xspace}`. 

4. [Oxford commas](https://en.wikipedia.org/wiki/Serial_comma), now that I've just used them. I have no particular reason to go against them, so I just try to always obey the rules.  

5. Mind the *which*es. I have to constantly battle my tendency of using "which" to supply an explanation to any sentence I write, which (this is on purpose!) is bad in a very subtle manner. It's often not even about the crazily long sentences one can get with the mighty *which*es. Instead, it is generally not clear what such a "which" is referring to. In my deliberate example, what is bad - the sentence, the explanation, or the tendency? Perhaps it seems very clear to me as a writer that I mean "the tendency" here, but one should always avoid making the readers *decipher* their text. Also, I believe the rule for "which" is that it should refer to the closest preceding thing, but don't count me on that.

6. Continuing on the previous point. "I believe the rule is ..., which makes my example wronger" is bad in a more twisted way. The precise thing that I'm trying to say is "the fact that the rule is ..." leads to something. This usage is common and well-understood in spoken English and informal writing, but it is not favorable in technical writing. An even more subtle version of this issue goes like this: "I believe the rule is ..., making my example ...". Again, it is unclear what the subject of "making" is. By the way, this entire point is written in the "favorable" style that avoids such issues. Basically, it is OK to end your sentences; just start a new one for what you want to say next!

7. The last piece of this ongoing trilogy of meta suggestions - avoid sole "This"s and "That"s ("This" is arguably more common in my experience). Note that I wrote "This usage is common..." instead of "This is common". Try your best to come up with a noun for what you are referring to. In fact, I dare you to open up your latest paper and search for `This is` - you will likely be in awe at how many you are using.

8. De-slop your language. TBA

# Section How-Tos

TBA

# Formatting 

Suggestions here are less about semantics and more about crafting a good-looking PDF with LaTex. Treat these as hard, rigorous guidelines.

> [!info] Local LaTeX + git v.s. Overleaf?
> I personally edit my papers using local LaTeX on my MacBook, and collaborate with coauthors and my advisor with `git` (this is also his preferred way). I'd say it's mostly a preference, but there have been incidents when [Overleaf failed before deadlines](!https://forum.cspaper.org/topic/71/overleaf-down-as-neurips-deadline-looms-a-familiar-academic-ritual). Some of the following points are also more relevant to the `git`way.

1. Avoid boldfaced or underlined text in the middle of a block of text. If you want to emphasize something, use `\emph{}`, which is rendered like `\textit{}`.

2. Spread out your paragraphs with explicit newlines (`\n`), instead of cramming each in one line and rely on your editor's text wrapping. This makes your life easier when tracking changes through `git`'s diff, and it also applies to Overleaf's [`git` integration](https://www.overleaf.com/learn/how-to/Git_integration%23Cloning_your_project_as_a_local_repository).

3. Avoid dangling ends of paragraphs - that is, when a paragraph ends with just a few words on the last line, leaving mostly a blank. They are (personally) not nice to look at, and eat up the precious page limit when you are trying to fit your paper into 12 or whatever pages. I personally fix these right after I write each paragraph, by paraphrasing my text (e.g., "in order to" -> "to", or usually just removing slops[^3]).

4. On that note, also avoid paragraphs that are too short, especially in the middle of a section. Besides looking bad, these almost always indicate unclear logic. Otherwise, just like a memory allocator performs defragmentation of free memory, coalesce consecutive short paragraphs and defragment your text.

5. If your paper falls short of the page limit, try your best to match the page limit exactly; that is, the last line of the conclusion ending at the bottom of the last permitted page. Some conferences may [discourage excessive padding](https://www.usenix.org/conference/osdi26/call-for-papers), but in my experience that's hardly the case. 

6. All figures, tables, and other diagrams are always expected to be aligned to the top (`[t!]` in LaTeX). If doing this makes your figures render in the wrong page, you can always move the environments around (even across sections when necessary).

7. The caption of a Figure should go below the diagram. The caption of a Table should go above it. Add your `\caption{}` to the right places.

8. `\vspace{}`[^2] is invaluable for adjusting paddings in figures, and controlling the paper layout and page limit in general. `\includegraphics[width=X \linewidth | \textwidth]` where `X` is less than 1 is also surprisingly impactful when shrinking the length of your paper.

9. The `overpic` package can come in handy when you need subfigure labels (e.g., (a), (b)) without bothering to actually break down your figure. It may also help save vertical space compared to an actual `subfigure`.

10. Format. Your. References. It seems tempting to just copy paste whatever BibTex code you can find on Google Scholar, ACM Digital Library, USENIX sites, etc., but they almost certainly come in different formats, which then mess up your reference section. My go-to no-brainer procedure goes like the following:
	* Use `@inproceedings` and `@misc` for everything. The former for all papers (including books), and the latter for blog posts, GitHub issues, or URLs in general.
	* Leave *only* four fields in an `@inproceeding` entry: `title`, `author`, `booktitle`, and `year`.
		* Take care to wrap words in braces to preserve capitalization. For instance, `{AI}` or `{FancySystemName}`. USENIX templates will render text as lower-case otherwise. 
		* `and` in `author` actually means something. Keep it as `{Yuxing, Xiang and ...}`.
		* `booktitle` is a major troublemaker. Keep the conference/journal name concise. Not `Proceedings of the ACM SIGOPS 31st Symposium on Operating Systems Principles (SOSP 25)`; just `ACM SOSP`. You've got the year covered in the `year` field. To keep this consistent, define and use string constants at the top of your bib file (e.g., `@String{ sosp = "ACM SOSP" }` and `booktitle = sosp`). Use `@String{ arxiv = "arXiv" }` for arXiv papers.
	* Leave *only* three fields in an `@misc` entry: `@misc{XXX, title={YYY}, year={ZZZ}, howpublished={\url{...}}}`.
* 




[^1]: I just felt like recommending Charles Berthoud. He's really good at bass though.
[^2]: The other day I read this very interesting [blog post](https://type.today/en/journal/spaces) explaining how the `pt`, `em`, `ex` units came about.
[^3]: This text is not a good example of this point, by the way. I enjoy writing like this when it's casual, but in technical text, always aim for concision.



