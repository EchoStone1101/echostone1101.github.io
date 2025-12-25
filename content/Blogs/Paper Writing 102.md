---
draft: false
tags:
  - Tutorials
  - Writing
---
This is an evolving post of my take on writing academic conference papers, specifically from the perspective of a PhD in the field of computer science. This is not:

- Paper writing 101. I don't plan to cover the basics of LaTeX, or tell you what sections should generally be in a paper. Better sources for these exist out there.
- Paper writing master class. I'm not a master in paper writing - even Charles Berthoud[^1] hasn't been on the master class for bass!

Instead, this is a list of my personal dos and don'ts that I find myself coming back to repeatedly when I write or edit my own papers. I figured it might be worth it to explicitly note them down, as my younger self would probably find some of these suggestions helpful. Likewise, I imagine this post to be the most interesting for other early-year PhDs out there who have just started writing their first paper - or, *no offense*, who have just gotten their first rejection and are feeling a bit sad. *No worries, we've all been there!*

So, without further ado, and in no particular order -

---
# General Checklists

These advice should apply to academic writing in general, and I always check them for my own papers.

1. If you made up names for your approach, techniques, or any other concepts, do not use them before their definitions. Yes, your paper should be more limited than a C program, because human readers are (quite understandably) less successful compilers.

2. Explain all your abbreviations at least once, unless it is really, *really* well-known (e.g., CPU, GPU, or AI). It's always "large language models (LLMs)" and "service-level objectives (SLOs)" in the introduction, and perhaps also in the background section.

3. "e.g.", "i.e.", and the like require a trailing comma `,` (*i.e.***,**  like this). To never mess this up, I always have them defined as macros, *e.g.***,** `\newcommand{\eg}{\emph{e.g.,}\xspace}`. 

4. [Oxford commas](https://en.wikipedia.org/wiki/Serial_comma), now that I've just used them. I have no particular reason to go against them, so I just try to always obey the rules.  

5. Mind the *which*es. I have to constantly battle my tendency of using "which" to supply an explanation to any sentence I write, which (this is on purpose!) is bad in a very subtle manner. It's often not even about the crazily long sentences one can get with the mighty *which*es. Instead, it is generally not clear what such a "which" is referring to. In my deliberate example, what is bad - the sentence, the explanation, or the tendency? Perhaps it seems very clear to me as a writer that I mean "the tendency" here, but one should always avoid making the readers *decipher* their text. Also, I believe the rule for "which" is that it should refer to the closest preceding thing, but don't count me on that.

6. Continuing on the previous point. "I believe the rule is ..., which makes my example wronger" is bad in a more twisted way. The precise thing that I'm trying to say is "the fact that the rule is ..." leads to something. This usage is common and well-understood in spoken English and informal writing, but it is not favorable in technical writing. An even more subtle version of this issue goes like this: "I believe the rule is ..., making my example ...". Again, it is unclear what the subject of "making" is. By the way, this entire point is written in the "favorable" style that avoids such issues. Basically, it is OK to end your sentences; just start a new one for what you want to say next!

7. The last piece of this ongoing trilogy of meta suggestions - avoid sole "This"s and "That"s ("This" is arguably more common in my experience). Note that I wrote "This usage is common..." instead of "This is common". Try your best to come up with a noun for what you are referring to. In fact, I dare you to open up your latest paper and search for `This is` - you will likely be in awe at how many you are using.

8. De-slop your language. Like [AI slop](https://en.wikipedia.org/wiki/AI_slop), unnecessary adjectives, adverbs or *fancy* words do harm to your arguments, because the meaning of slop expressions is often unclear and edges towards over-claiming. For example, your system should not be "*truly* effective", it should just be "effective". What does "*truly*" mean, anyway? Is something else less effective? How do you measure effectiveness? And - you've got the point. Be concise and precise in your wording, and think twice next time before you use any big words.

# Section How-Tos

I lied a little when I said I won't talk about actual sections in a paper - I do have my two cents on how the sections should generally be organized. Templates, if you will. And there's nothing wrong with a bit of boilerplate - beautiful proses are nice, but it's the idea behind them that really matters in your paper. That said, the suggestions here are relatively subjective.

### Introducing the Introduction

The introduction section is arguably the most important part of a paper. For me, a good introduction is basically a boiled-down version of the full paper, complete with the problem description, the motivation, the proposed approach, and terse evaluation results, excluding only the elaborate, technical details. 

In other words, ask yourself this: can someone get away with reading *only* your introduction, and still feel like they have a solid grasp of your work (in the case where that "someone" is an reviewer, would they understand your contribution and be tempted to accept your paper)? If you find your work to be entirely technical nitty-gritty, abstract it. Distill wisdom from it, even at the cost of distorting some details[^2], as long as you can reasonably defend your conclusions. More often than not, "oversimplification" will turn out, and you realize that your old view at the problem is actually flawed.

This is why everybody talks about the introduction "storyline" - for maybe 2 out of 12 pages of your paper, you are indeed writing a "story" to excite your readers and convey a moral. And, like every good fable, it is OK to follow a stereotyped structure:

* Open with one paragraph of general background that your problem lies within. I have already lost track of how many times I have written "Recent advancement in generative AI has ..." - or something along the line!

* Then, cut straight to the problem. Maybe there's great GPU wastage in a certain scenario. Or there are nasty bugs hidden in that important software stack.

* Naturally, the motivation of your work follows. Of course, unless you are working on something brand new, there usually are "existing solutions" that partly solve the problem you've pointed out. So often this is a two-paragraph cliche: "Prior works have explored...yet they remain limited due to...", and "We propose \[our approach\], ...". This should also be the most challenging part to write, really putting your abstraction to the test.

* Next, a summary of the technical challenges and solutions. Compared to the rest of introduction, this is usually relaxing to write.

* Finally, a report of your evaluation results, and a list of your claimed contributions ("In summary, we make the following contributions..."). For longer papers, some people like to include a "table of content" for each remaining section (e.g., "Section 3 describes..."), but I find that quite redundant and personally avoid it.

But, alas, it is never as simple as filling-in-the-blanks even after you've got the template, because that's just half of the task. Literally not a single introduction in all my papers was written in one go, and that's a natural and necessary process. Hell, I'd even say that following such a pronounced logic structure in the introduction usually surfaces weaknesses in my idea, forcing me to improve my abstracted storyline, and sometimes making me go back to the drawing board. It's a bit like the programming experience with a strong type system, like in Rust - when the compiler rejects my code and makes me refactor, there's likely an actual flaw hidden in my implementation - or in this case, in my storyline. 

**This is also where I admit that I like to write the introduction first in my paper**. I have surely seen other people do the opposite, but for me writing the introduction is just the mandatory meditation that I have to go through for me to get in touch with the rest of the paper. If the introduction is done, then everything else just falls into the place. Otherwise, I am not invested in any single word I write. 

### Background, or Related? 

Following the introduction section, it is either the "Background" or the "Related Work", corresponding to two approaches:

* **"Related Work" first**. Commonly seen in AI-related, single-column, shorter (8-paged) papers. In this case, the preliminary of the work is usually less complex (easier to describe and understand), thus already covered in the introduction and saving the need for a dedicated background section. On the other hand, the body of existing related literature tends to be immense, and reading the paper begs the question "well, I wonder how this work differs from XXX or YYY" in every reader's mind. So it makes sense that you immediately address that question with a related work section.

* **"Background" first**. My personal pick for system-related, double-column, longer (12-paged) papers, where some preliminary knowledge is genuinely required (think formal verification of some system X; you'll need to explain a bit about both verification and X), or there is more to your motivation (e.g., some microbenchmarks to consolidate that you are tackling a real problem) for fully appreciating your work. It is also often natural to put in a subsection to describe (the drawbacks of) representative baselines, or elaborate on the challenges that you've set out to address. Meanwhile, the related work section is postponed to the end of the paper, where you should be discussing how your work complements existing research, instead of defending your novelty.

Whichever approach you choose, don't miss out on the related work section! A good related work section should not be:

* A list of mindless "honorable mentions" of studies you happen to know. The work you include here is meant to represent your understanding of the subject - a compact survey of the field, if you will - and should serve as a relatively comprehensive map for the readers to read on.

* Repetitions of "XXX also did something similar" without any verdict. It is not enough to just reference related prior studies - you are expected to briefly comment on why/how you've improved stuff, or added to their results.

# Formatting 

Suggestions here are less about semantics and more about crafting a good-looking PDF with LaTeX. Treat these as hard, rigorous guidelines.

> [!info] Local LaTeX + git v.s. Overleaf?
> I personally edit my papers using local LaTeX on my MacBook, and collaborate with coauthors and my advisor with `git` (this is also his preferred way). I'd say it's mostly a preference, but there have been incidents when [Overleaf failed before deadlines](!https://forum.cspaper.org/topic/71/overleaf-down-as-neurips-deadline-looms-a-familiar-academic-ritual). Some of the following points are also more relevant to the `git`way.

1. Avoid boldfaced or underlined text in the middle of a block of text. If you want to emphasize something, use `\emph{}`, which is rendered like `\textit{}`.

2. Spread out your paragraphs with explicit newlines (`\n`), instead of cramming each in one line and rely on your editor's text wrapping. This makes your life easier when tracking changes through `git`'s diff, and it also applies to Overleaf's [`git` integration](https://www.overleaf.com/learn/how-to/Git_integration%23Cloning_your_project_as_a_local_repository).

3. Avoid dangling ends of paragraphs - that is, when a paragraph ends with just a few words on the last line, leaving mostly a blank. They are (personally) not nice to look at, and eat up the precious page limit when you are trying to fit your paper into 12 or whatever pages. I personally fix these right after I write each paragraph, by paraphrasing my text (e.g., "in order to" -> "to", or usually just removing slops[^3]).

4. On that note, also avoid paragraphs that are too short, especially in the middle of a section. Besides looking bad, these almost always indicate unclear logic. Otherwise, just like a memory allocator performs defragmentation of free memory, coalesce consecutive short paragraphs and defragment your text.

5. If your paper falls short of the page limit, try your best to match the page limit exactly; that is, the last line of the conclusion ending at the bottom of the last permitted page. Some conferences may [discourage excessive padding](https://www.usenix.org/conference/osdi26/call-for-papers), but in my experience that's hardly the case. 

6. All figures, tables, and other diagrams are always expected to be aligned to the top (`[t!]` in LaTeX). If doing this makes your figures render in the wrong page, you can always move the environments around (even across sections when necessary).

7. The caption of a Figure should go below the diagram. The caption of a Table should go above it. Add your `\caption{}` to the right places.

8. `\vspace{}`[^4] is invaluable for adjusting paddings in figures, and controlling the paper layout and page limit in general. `\includegraphics[width=X \linewidth | \textwidth]` where `X` is less than 1 is also surprisingly impactful when shrinking the length of your paper.

9. The `overpic` package can come in handy when you need subfigure labels (e.g., (a), (b)) without bothering to actually break down your figure. It may also help save vertical space compared to an actual `subfigure`.

10. Format. Your. References. It seems tempting to just copy paste whatever BibTex code you can find on Google Scholar, ACM Digital Library, USENIX sites, etc., but they almost certainly come in different formats, which then mess up your reference section. My go-to no-brainer procedure goes like the following:
	* Use `@inproceedings` and `@misc` for everything. The former for all papers (including books), and the latter for blog posts, GitHub issues, or URLs in general.
	* Leave *only* four fields in an `@inproceeding` entry: `title`, `author`, `booktitle`, and `year`.
		* Take care to wrap words in braces to preserve capitalization. For instance, `{AI}` or `{FancySystemName}`. USENIX templates will render text as lower-case otherwise. 
		* `and` in `author` actually means something. Keep it as `{Yuxing, Xiang and ...}`.
		* `booktitle` is a major troublemaker. Keep the conference/journal name concise. Not `Proceedings of the ACM SIGOPS 31st Symposium on Operating Systems Principles (SOSP 25)`; just `ACM SOSP`. You've got the year covered in the `year` field. To keep this consistent, define and use string constants at the top of your bib file (e.g., `@String{ sosp = "ACM SOSP" }` and `booktitle = sosp`). Use `@String{ arxiv = "arXiv" }` for arXiv papers.
	* Leave *only* three fields in an `@misc` entry: `@misc{XXX, title={YYY}, year={ZZZ}, howpublished={\url{...}}}`.


[^1]: I just felt like recommending Charles Berthoud. He's really good at bass though.
[^2]: Deliberately blatant wording. However, it's not "retrofitting" effects to imaginary causes - that is violating academic integrity. Instead, I'm talking about how one interprets technical results to derive elegant and helpful take-aways.
[^3]: This text is not a good example of this point, by the way. I enjoy writing like this when it's casual, but in technical text, always aim for concision.
[^4]: The other day I read this very interesting [blog post](https://type.today/en/journal/spaces) explaining how the `pt`, `em`, `ex` units came about.


