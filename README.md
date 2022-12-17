# Prefunc

A Minecraft Datapack Preprocessor.

## Installation

Install prefunc globally for command line access with NPM:

```sh
npm i -g prefunc
```

If you don't have Node and NPM installed, you can get it from [here](https://nodejs.org/en/).

## Purpose

Minecraft Datapack Language has improved significantly over the years,
however a key piece is still missing - being able to easily use lists
of strings in multiple commands.

Say, for example, you want to give a player a list of items, check if
they have it, then clear it. Using the default syntax, it would look
like this:

```
give @s item_1
give @s item_2
give @s item_3
give @s item_4
give @s item_5
execute as @s[nbt={Inventory:[{id:"minecraft:item_1"}]}] run ...
execute as @s[nbt={Inventory:[{id:"minecraft:item_2"}]}] run ...
execute as @s[nbt={Inventory:[{id:"minecraft:item_3"}]}] run ...
execute as @s[nbt={Inventory:[{id:"minecraft:item_4"}]}] run ...
execute as @s[nbt={Inventory:[{id:"minecraft:item_5"}]}] run ...
clear @s item_1
clear @s item_2
clear @s item_3
clear @s item_4
clear @s item_5
```

While this is simple enough for five items, it shows how annoying dealing
with lists is, and maintaining this code is even worse.

With Prefunc, the above code would look like this:

```
#! def items = item_1, item_2, item_3, item_4, item_5
#! give @s <items>
#! execute as @s[nbt={Inventory:[{id:"minecraft:<items>"}]}] run ...
#! clear @s <items>
```

It makes working with large lists significantly easier.

## Setup

To begin using prefunc, rename your inner datapack folder to include a `~` at the beginning.

A folder structure like this:

```
world_name
 └ datapacks
    └ datapack_name
       └ data
          └ inner_name
             └ functions
                └ ...
       └ pack.mcmeta
```

would therefore become this:

```
world_name
 └ datapacks
    └ datapack_name
       └ data
          └ ~inner_name
             └ functions
                └ ...
       └ pack.mcmeta
```

Running the build command will run the preprocessor and output files to data/inner_name without the `~`.
The tilda is used as it makes all functions in-game appear after the output functions, interfering less
with the usual workflow.

## Usage

All files the preprocessor runs checks on have to end with either .mcfunction or .prefunc, though it is
recommended to use .mcfunction for syntax highlighting in an IDE. Prefunc instructions start with a `#!`,
so that syntax highlighters and linters ignore them.

### Lists

To define a list, use the following syntax:

```
#! def list_name = list_item_1, list_item_2, list_item_3, ...
```

A list of wooden tools would look like such:

```
#! def tools = wooden_sword, wooden_shovel, wooden_pickaxe, wooden_hoe, wooden_axe
```

You can then use a list in a command like this:

```
#! def tools = wooden_sword, wooden_shovel, wooden_pickaxe, wooden_hoe, wooden_axe
#! give @a <tools>
```

where `<tools>` will be replaced with all list items on seperate lines. This code would evaluate
to the following:

```
give @a wooden_sword
give @a wooden_shovel
give @a wooden_pickaxe
give @a wooden_hoe
give @a wooden_axe
```

### Global Variables

Keep in mind you can only use variables in the file they are defined and only after they have
been defined. This would not work:

```
#! tellraw @a "<texts>"
#! def texts = Congratulations!, You Won!
```

To use variables accross your whole project, add the global modifier (`*`) in front of the variable
name to turn it into a global variable, like such:

```
globals.mcfunction:
#! def *texts = Congratulations!, You Won!

tellraw.mcfunction:
#! tellraw @a "<texts>"
```

As the `*texts` variable is marked as global, it will work anywhere.

### Maps

To define a map (linked lists), use the following syntax:

```
#! def map_field_1:map_field_2 = field_1_item_1:field_2_item_1, field_1_item_2:field_2_item_2
```

A map could be used to give players items with set amounts, like such:

```
#! def items:amounts = iron_sword:1, oak_planks:32, golden_apple:8
```

Using a map in a command would look like such:

```
#! def items:amounts = iron_sword:1, oak_planks:32, golden_apple:8
#! give @a <items> <amounts>
```

The above code would evaluate to:

```
give @a iron_sword 1
give @a oak_planks 32
give @a golden_apple 8
```

Defining a global map is still done with one global modifier before the map name, like such:

```
globals.mcfunction:
#! def *texts:colors = Congratulations!:red, You Won!:green

tellraw.mcfunction:
#! tellraw @a {"text":"<texts>","color":"<colors>"}
```

## Building the project

Once you have written your prefunc-compatible functions and renamed your working directory
to start with a `~` (see the Setup section), navigate to _outside_ the data and pack.mcmeta
files (just inside your datapack folder) and run the following command from the command line
(make sure you have prefunc installed - see the Installation section):

```sh
prefunc
```

Prefunc should build the project and output how long it took. The processed datapack can be
found right next to the working directory (marked with a `~`).

## Issues

If you experience any issues using prefunc, please check for any errors on your part first,
if the issue persists, open up an issue in this repository.

## License

This project is released under the [MIT License](https://choosealicense.com/licenses/mit/).
