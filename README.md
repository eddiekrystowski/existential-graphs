<div align="center">
<img src="https://i.ibb.co/JQspFJZ/eg-banner.jpg">
    <br />
    <br />
    <a href="https://choosealicense.com/licenses/gpl-3.0/"><img src="https://img.shields.io/badge/license-GPL%203.0-red" alt="GPL 3.0 License"></a>
    <br />
    <i>A tool for diagrammatic notation of logical expressions</i>
</div>
<hr />

Existential Graphs is a web app that enables the manipulation of logical expressions using a visual notation. It was created by [Dr. Bram van Heuveln](https://science.rpi.edu/itws/faculty/bram-van-heuveln), whose goal for this project is to provide another unique approach to solving logical expressions to students.

<br />

## If you would like to access Existential Graphs, the  live website can be found [here](https://eg.bram-hub.com/).
> Note: Existential Graphs is currently under development. As such the live website will not always be in sync with what is here in the repository. Currently, the live website is on a functionally complete version, however a rehaul of the website should end up going live in the near future.

## Table of Contents
- [If you would like to access Existential Graphs, the  live website can be found here.](#if-you-would-like-to-access-existential-graphs-the--live-website-can-be-found-here)
- [Table of Contents](#table-of-contents)
- [Background](#background)
- [Use Cases](#use-cases)
  - [Guided Proof Mode](#guided-proof-mode)
  - [Unguided Proof Mode](#unguided-proof-mode)
- [For Educators](#for-educators)
- [For Students](#for-students)
- [Development](#development)
- [License](#license)

## Background
Dr. van Heuveln has taught logic courses on a frequent basis for the past 15 years, and noted that a good number of students struggle with the systems of modern formal logic that were developed in the late 1800's and early 1900's, and that have been universally used in logic courses since. These traditional systems use abstract linear symbol strings such as `(P & Q) -> (R v S)`, and deploy even more abstract rules such as & Elim to infer new symbol strings from old ones, thus engaging the user in logical reasoning. 

This project brings about the idea that there are unique ways to view logical expressions, as well as teach students about logic.

The idea at the core of Existential Graphs, graphical logic, was first written about in 1882 by Charles Sanders Peirce. While it is interesting and in many cases helpful to analyze logical expressions with a graphical system, it is largely infeasible due to physical constraints. The only way to use existential graphs so far has been on paper or a whiteboard, where you are limited by space, and have to redraw the whole logical expression every step, or lose your previous steps. The Existential Graphs web application is one of the first, if not the first, publicly available systems to use graphical logic.

## Use Cases
The Existential Graphs web application can be used by philosophers, educators, and students alike. The experience can be very beginner friendly in the guided mode, or act more as a sandbox in the unguided proof mode.



### Guided Proof Mode
Guided Proof Mode is intended mainly for beginners to existential graphs. In this mode, you are given a pallet of operations that are available in existential graphs which you are allowed to use to manipulate the graph. You are not allowed to make incorrect proof steps, which makes this a safe space to learn the basics of existential graphs.

### Unguided Proof Mode
Unguided Proof Mode is the main mode intended for Existential Graphs. In this mode, you can directly operate on the graph and define what proof step you took. This allows for users to make logically invalid steps, which is great for students who are beyond a beginner level. This mode also has proof validation, which will tell you which steps you took were logically valid, as well as the steps that you took that were logically invalid.

## For Educators
As an educator, you are able to create a "Problem". A problem is simply a graph with an initial state and a goal state. With this problem, you are able to send it to your students and have them solve it. Their goal is to get from the initial state to the goal state, using only valid logical operations. Existential Graphs can check the validity of these steps, making grading easy for educators.

## For Students
As a student, you are able to upload problem files that you have received from your professor. When you open the problem file, you will see an initial state and a goal state. Your objective is to take the initial state graph, and manipulate it using logical steps until you reach the goal state. As you work with the graph, your steps will create branches, so don't worry about losing your progress if you want to explore a different route.

Additionally, if you are interested in computer science and programming, please consider contributing to Existential Graphs! Not only would it be a great way to practice logical reasoning, but it is also a great way to dip your toes into open source software and contributing to open source projects. 

## Development
To work on and run this project, you will need to have Node.js installed.

You will have to run two terminals :

In the first terminal :
```
cd server
npm i
npm run start
```
In the second terminal :
```
cd client
npm i
npm run start
```
Now everything should be up and running for you to work on Existential Graphs!
## License
Existential Graphs is licensed under the GPL-3.0 license, which can be viewed [here](LICENSE).
```
Existential Graphs: A Unique Approach to Formal Logic
Copyright (C) 2022, the Existential Graphs Developers

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
 ```