XBreeding. The RUST farmer's assistant
======================================

Program to calculate crossbreadings between your clones inside the game RUST of FacePunch Studios.
Copy the genes of your clones, select the desired result, and press CALCULATE.
It can be used with Hemp, Corn, Pumpkins, and the recently added multicolor Berries.
Since it is implemented in JavaScript, there is no need of installing any software in your system.
No relation with FacePunch Studios here.

Try it at: [https://alierum.github.io/](https://alierum.github.io/).

User manual: [https://github.com/alierum/alierum.github.io/wiki/XBreeding-Manual](https://github.com/alierum/alierum.github.io/wiki/XBreeding-Manual).


Interaction with other programs
-------------------------------

To recieve parameters from other programs, use the url (via GET).

Parameters (begining with **?** and concatenated using **&**):

- **e**: experiment name, e.g. `c=hemp` (maximum 10 characters)
- **c**: clone list, e.g. `c=yyxxhygghywy` (groups of 6 characters)
- **t**: target, e.g. `t=yyyggg` (same as `t=gygygy`)
- **f**: filters, e.g. `f=w` or `f=x` or `f=wx`
- **g**: go, launches the calculation, e.g. `g` (same as `g=something`)

For example:

[https://alierum.github.io/?e=hemp&c=yyxgyygygwgghhggygggyhwhwhgghhyyghyh&t=yyyggg&f=x&g](https://alierum.github.io?e=hemp&c=yyxgyygygwgghhggygggyhwhwhgghhyyghyh&t=yyyggg&f=x&g).


More info:
----------
[Rust](https://rust.facepunch.com/).

[Rust | Ultimate Cross Breeding Guide (new/updated)](https://www.youtube.com/watch?v=WQ0ixceBZwA).

[Rust | The Complete Watering Guide (Automatic Sprinklers)](https://www.youtube.com/watch?v=X7oxG2A4oCM).


TO DO:
------
- Autosplit the clone list while typing.
- Different planter configuration: 3 and 9.
- Autoajust page height to different screen sizes.
- Saving and recovering clone lists in the user's browser local storage.
- Check to show all results.
- Check to show/hide tooltips.
- Iterative stoppable process showing the best result found so far using several generations.

