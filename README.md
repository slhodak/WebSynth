# WebSynth

## Description

A browser-based subtractive synthesizer.  

**In this document**  
Hotkey actions are given in italicized brackets (ex: _\[o\]_).

## Installation
1) Clone this repo
2) `npm install`  
3) `npm run start`.

## Synthesizer Usage

Create arbitrary numbers of oscillator _\[o\]_ and filter _\[f\]_ nodes.

A routing table appears when the first node has been created.

Route a node's output by clicking from a source node (left column of routing table) to a destination node (any other column on routing table). Eligible destinations are given in blue, the source's current destination is green, and ineligible routes are red.


## Saving & Loading Presets

Presets can be saved and named using the _Save Synth Preset_ module. Attempting to overwrite an old save, unless the overwrite button is activated (green), will render a prompt saying that the given name is already in use.
Load a preset using the load preset module dropdown. Doing so will overwrite all current settings. 
