/*jslint bitwise : true, evil : true*/
/*jshint -W061*/
/*global Event*/
/* object : STable / prototype{{{*/
var STable = (function () {
    "use strict";
    /* object : SmartToggle prototype/ smart toggle object to render{{{*/
    var smartToggleProto = {
        /* bool function get () / retrn current status {{{*/
        get : function () {
            return !this.dept;
        },
        /*get end }}}*/
        /* null function set (bool flag) / increment/decrimet smartToggle {{{*/
        set : function (flag) {
            if (flag && this.dept === 0) {return; }
            if (flag) {this.dept--; } else {this.dept++; }
        },
        /*set end }}}*/
    };
    /*smartToggle end}}}*/
    /* obj function SmartToggle () / smart toggle constructor {{{*/
    var SmartToggle = function () {
        Object.setPrototypeOf(this, smartToggleProto);
        this.dept = 0;
    };
    /*SmartToggle end }}}*/
    /* object : Render prototype / render ptototype (viev) {{{*/
    var renderProto = {
        /* dom function defaultDrawS (mix value) /  {{{*/
        defaultDrawS : function (value) {
            var div = document.createElement('div'); 
            div.innerHTML = value;
            return div;
        },
        /*defaultDrawS end }}}*/
        /* dom function defaultDrawE (mix value) /  {{{*/
        defaultDrawE : function (value) {
            var div = document.createElement('div');
            var input = document.createElement('input');
            div.appendChild(input);
            input.value = value;
            return div;
        },
        /*defaultDrawE end }}}*/
        /* null function init (dom container) / init render {{{*/
        init : function (container) {
            this.container = container;
            this.table = container.appendChild(document.createElement('table'));
            this.tHead = this.table.appendChild(document.createElement('tHead'));
            this.tBody = this.table.appendChild(document.createElement('tBody'));
            this.container.sTable = {table : this.sTable, type : 'container'};
            this.table.sTable = {table : this.sTable, type : 'table'};
            this.tBody.sTable = {table : this.sTable, type : 'body'};
            this.tHead.sTable = {table : this.sTable, type : 'head'};
            
        },
        /*init end }}}*/
        /* null function drawHeader (array data) /  drawing headers{{{*/
        drawHeader : function (data) {
            this.tHead.innerHTML = '';
            var row = this.tHead.insertRow(-1);
            row.sTable = {table : this.sTable, type : 'headers'};
            var i = 0;
            var cell;
            for (i = 0; i < data.length; i++) {
                cell = row.insertCell(-1);
                cell.innerHTML = data[i].value;
                cell.id = data[i].id;
                cell.sTable = {table : this.sTable, type : 'header', mCell : data[i].coll};
                cell.classList.add('sTable_header');
            }
        },
        /*drowHeader end }}}*/
        /* null function drawBody (array data) /  {{{*/
        drawBody : function (data) {
            this.tBody.innerHTML = '';
            var i = 0;
            var j = 0;
            for (i = 0; i < data.length; i ++) {
                for (j = 0; j < data[i].cell.length; j++) {
                    this.drawCell(data[i].cell[j].get(), i, j, data[i].num, data[i].cell[j].num);
                }
            }
        },
        /*drawBody end }}}*/
        /* null function drawCell (mix value, int r, int c, int mr, int mc) /  {{{*/
        drawCell : function (value, r, c, mr, mc) {
            if (!this.tBody.rows[r]) {
                this.tBody.insertRow(r);
                this.tBody.rows[r].classList.add('sTable_row');
                this.tBody.rows[r].id = this.sTable.id + "_row_" + r;
            }
            var row = this.tBody.rows[r];
            row.sTable = {table : this.sTable, row : r, type : 'row'};
            if (!row.cells[c]) {row.insertCell(c); }
            var cell = row.cells[c];
            cell.innerHTML = '';
            //cell.classList = '';
            var classLength = cell.classList.length;
            while (classLength !== 0) {
                cell.classList.remove(cell.classList[classLength]);
                classLength--;
            }
            if (typeof this.sTable.tabindex === "number") {
                cell.setAttribute("tabindex", this.sTable.tabindex);
            }
            if (this.mode[c] === 'edit' || this.mode[c] === 'toggle') {
                if (this.drawE[c]) {
                    cell.appendChild(this.drawE[c](value, r, c));
                } else {
                    cell.appendChild(this.defaultDrawE(value, r, c));
                }
                cell.lastChild.classList.add('sTable_editContent');
            }
            if (this.mode[c] === 'show' || this.mode[c] === 'toggle') {
                if (this.drawS[c]) {
                    cell.appendChild(this.drawS[c](value, r, c));
                } else {
                    cell.appendChild(this.defaultDrawS(value, r, c));
                }
                cell.lastChild.classList.add('sTable_showContent');
            }
            if (this.mode[c] === 'edit') {
                cell.classList.add('sTable_edit');
            } else {
                cell.classList.add('sTable_show');
            }
            cell.sTable = {table : this.sTable, vRow : r, vCell : c, type : 'cell', mRow : mr, mCell : mc};
            cell.id = this.sTable.id + '_cell_' + c;
            cell.classList.add('sTable_cell');
            if (typeof this.sTable.tabindex === "number") {
                cell.setAttribute("tabindex", this.sTable.tabindex);
                var inputs = cell.querySelectorAll('input,textarea,select');
                var i = 0;
                for (i = 0; i < inputs.length; i++) {
                    inputs[i].setAttribute("tabindex",this.sTable.tabindex);
                }
            }
        },
        /*drawCell end }}}*/
        /* null function addDrawE (int coll, fun funct) / add function for draw Edit {{{*/
        addDrawE : function (coll, funct) {
            this.drawE[coll] = funct;
        },
        /*addDrawE end }}}*/
        /* null function addDrawS (int coll, fun funct) / add function for draw Show {{{*/
        addDrawS : function (coll, funct) {
            this.drawS[coll] = funct;
        },
        /*addDrawS end }}}*/
        /* null function setMode (int coll, str mode) / mode is "viev"|"edit"|"toggle" {{{*/
        setMode : function (coll, mode) {
            this.mode[coll] = mode;
        },
        /*setMode end }}}*/
        /* null function toggleCell (r, c) /  {{{*/
        toggleCell : function (r, c) {
            var cell = this.tBody.rows[r].cells[c];
            if (cell.classList.contains('sTable_edit')) {
                this.toggleCellToShow(cell);
            } else {
                this.toggleCellToEdit(cell);
            }
        },
        /*toggleCell end }}}*/
        /* null function toggleCellToShow (dom cell) /  {{{*/
        toggleCellToShow : function (cell) {
            cell.classList.add('sTable_show');
            cell.classList.remove('sTable_edit');
            this.sTable.conveyor.updateCellFVC(this.currentEdit.sTable.vRow, this.currentEdit.sTable.vCell);
            this.currentEdit = undefined;
        },
        /*toggleCellToShow end }}}*/
        /* null function toggleCellToEdit (dom cell) /  {{{*/
        toggleCellToEdit : function (cell) {
            this.clearCellEdit();
            cell.classList.add('sTable_edit');
            cell.classList.remove('sTable_show');
            this.currentEdit = cell;
        },
        /*toggleCellToEdit end }}}*/
        /* null function clearCellEidt () /  {{{*/
        clearCellEdit : function () {
            if (this.currentEdit) {this.toggleCellToShow(this.currentEdit); }
        },
        /*clearCellEidt end }}}*/
    };
    /*Render end}}}*/
    /* obj function Render (obj sTable) / render constructor (viev) {{{*/
    var Render = function (sTable) {
        Object.setPrototypeOf(this,renderProto);
        this.sTable = sTable;
        this.status = new SmartToggle();
        this.conteiner = '';
        this.table = '';
        this.tHead = '';
        this.tBody = '';
        this.drawE = [];
        this.drawS = [];
        this.mode = [];
        this.currentEdit = '';
        this.currentSelect = '';
    };
    /*Render end }}}*/
    /* object : Frame prototype / frame prototype {{{*/
    var frameProto = {
        /* null function parse (obj opt) / parse options {{{*/
        parse : function (opt) {
            if (opt.hasOwnProperty('start') && typeof opt.start === 'number') {this.start = opt.start; }
            if (opt.hasOwnProperty('size') && typeof opt.size === 'number') {
                this.size = opt.size; 
                this.end = this.start + this.size;
            } else if (opt.hasOwnProperty('end') && typeof opt.end === 'number') {
                this.end = opt.end; 
                this.size = this.end - this.start;
            } 
            if (opt.hasOwnProperty('step') && typeof opt.step === 'number') {this.stepSize = opt.step; }
            this.conveyor.run(3);
        },
        /*parse end }}}*/
        /* null function next (int num) /  {{{*/
        next : function (num) {
            if (typeof num !== 'number' || num < 1) {num = 1; }
            this.start += this.size * num;
            this.end += this.size * num;
            this.conveyor.run(3);
        },
        /*next end }}}*/
        /* null function prev (int num) /  {{{*/
        prev : function (num) {
            if (typeof num !== 'number' || num < 1) {num = 1; }
            this.start -= this.size * num;
            this.end -= this.size * num;
            this.conveyor.run(3);
        },
        /*prev end }}}*/
        /* null function set (int num) /  {{{*/
        set : function (num) {
            if (typeof num !== 'number' || num < 0) {return; }
            this.start = this.size * num;
            this.end = this.start + this.size;
            this.conveyor.run(3);
        },
        /*set end }}}*/
        /* null function step (int num) /  {{{*/
        step : function (num) {
            if (typeof num !== 'number' || num < 1) {num = 1; }
            this.start += this.stepSize * num;
            this.end += this.stepSize * num;
            this.conveyor.run(3);
        },
        /*step end }}}*/
        /* null function back (int num) /  {{{*/
        back : function (num) {
            if (typeof num !== 'number' || num < 1) {num = 1; }
            this.start -= this.stepSize * num;
            this.end -= this.stepSize * num;
            this.conveyor.run(3);
        },
        /*back end }}}*/
        /* null function align (int num) /  {{{*/
        align : function (num) {
            if (typeof num !== 'number' || num < 0) {return; }
            this.start = num;
            this.end = this.start + this.end;
            this.conveyor.run(3);
        },
        /*align end }}}*/ 
        /* null function incl (num) /  {{{*/
        incl : function (num) {
            if (typeof num !== 'number' || num < 0) {return; }
            this.conveyor.status.set(false);
            while (num < this.start) {
                this.prev();
            }
            while (num > this.end) {
                this.next();
            }
            this.conveyor.status.set(true);
            this.conveyor.run(3);
        },
        /*incl end }}}*/
    };
    /*Frame end}}}*/
    /* obj function Frame (obj conveer) / frame constructor {{{*/
    var Frame = function (conveyor) {
        Object.setPrototypeOf(this, frameProto);
        this.conveyor = conveyor;
        this.size = 20;
        this.start = 0;
        this.end = 20;
        this.stepSize = 5;
    };
    /*Frame end }}}*/
    /* object : Conveyor prototype / conveyor prototype (controler) {{{*/
    var conveyorProto = {
        FILT : 1,
        SORT : 2,
        REV : 4,
        FRAME : 8,
        MIX : 16,
        /* array function mixC (array data) /  {{{*/
        mixC : function (data) {
            var i = 0;
            var j = 0;
            var tempArr = [];
            for (i = 0; i < data.length; i++) {
                tempArr[i] = {cell : [], num : data[i].num};
                for (j = 0; j < this.name.length; j++) {
                    tempArr[i].cell[j] = data[i].cell[this.sTable.table.getNumFromName(this.name[j])];
                }
            }
            return tempArr;
        },
        /*mixC end }}}*/
        /* array function filter (array data) / filtering data {{{*/
        filtC : function (data) {
            var i = 0;
            var j = 0;
            var tempArray = [];
            var flag = true;
            for (i = 0; i < data.length; i++) {
                flag = true;
                if (data[i].hiden) { continue; }
                for (j = 0; j < this.filter.length; j++) {
                    if (!this.filter[j]) {continue; }
                    if (this.filter[j](data[i].cell[j].get())) {
                        flag = false;
                        break;
                    }
                }
                if (flag) {
                    tempArray.push(data[i]);
                }
            }
            return tempArray;
        },
        /*filter end }}}*/
        /* fun function getSortFunction () /  {{{*/
        getSortFunction : function () {
            var sorter = this.sorter;
            var sortPriority = this.sortPriority;
            return function (a, b) {
                var i = 0;
                var ind = 0;
                var flag = 0;
                for (i = 0; i < sortPriority.length; i++) {
                    ind = sortPriority[i];
                    if (sorter[ind]) {
                        flag = sorter[ind](a.cell[ind].get(),b.cell[ind].get());
                    } else {
                        if (a.cell[ind].get() > b.cell[ind].get()) {
                            flag = 1; 
                        } else if (a.cell[ind].get() < b.cell[ind].get()) {
                            flag = -1;
                        } else {
                            flag = 0;
                        }

                    }

                    if(flag !== 0) {
                        return flag;
                    }
                }
                return flag;
            };
        },
        /*getSortFunction end }}}*/
        /* array function sort (array data) / sorting data {{{*/
        sortC : function (data) {
            var tempArray = data.slice(0);
            var sortF = this.getSortFunction();
            return tempArray.sort(sortF);
        },
        /*sort end }}}*/
        /* array function reverse (array data) /  {{{*/
        reverceC : function (data) {
            return data.slice(0).reverse();
        },
        /*reverce end }}}*/
        /* array function frame (array data) / frame data {{{*/
        frameC : function (data) {
            this.status.set(false);
            if (this.frame.start < 0) {this.frame.set(0); }
            if (this.frame.start > data.length) {this.frame.incl(data.length); } 
            this.status.set(true);
            return data.slice(this.frame.start, this.frame.end);
        },
        /*frame end }}}*/
        /* null function addSortFunction (int coll, fun funct) /  {{{*/
        addSortFunction : function (coll, funct) {
            this.sorter[coll] = funct;
        },
        /*addSortFunction end }}}*/
        /* null function addFilterFunction (int coll, fun funct) /  {{{*/
        addFilterFunction : function (coll, funct) {
            this.filter[coll] = funct;
        },
        /*addFilterFunction end }}}*/
        /* null function addAlsoUpdate (int coll, mix value) /  {{{*/
        addAlsoUpdate : function (coll, value) {
            if (!this.alsoUpdate[coll]) {this.alsoUpdate[coll] = []; }
            if (Array.isArray(value)) {
                var i = 0;
                for (i = 0; i < value.length; i++) {
                    if (typeof value[i] === 'number') {
                        this.alsoUpdate[coll].push(value[i]);
                    }
                }
                return;
            }
            if (typeof value === 'number') {
                this.alsoUpdate[coll].push(value);
            }
        },
        /*addAlsoUpdate end }}}*/
        /* null function headerProcessing (array headers) /  {{{*/
        headerProcessing : function () {
            if (!this.status.get()) {return; }
            var i = 0;
            var tempArray = [];
            for (i = 0; i < this.name.length; i++) {
                tempArray[i] = {};
                tempArray[i].coll = this.sTable.table.getNumFromName(this.name[i]);
                tempArray[i].value = this.sTable.table.header[this.sTable.table.getNumFromName(this.name[i])];
                tempArray[i].id = this.sTable.id + '_header_' + i;
            }
            this.sTable.render.drawHeader(tempArray);
        },
        /*headerProcessing end }}}*/ 
        /* null function run (int stage, byte skip) / run conveer and draw{{{*/
        run : function (stage, set) {
            if (!this.status.get()) {return; }
            if (typeof stage !== "number") {stage = 0; }
            if (typeof set !== "number") {
                set = 0;
                set += this.FILT;
                if (this.sortFlag) {set += this.SORT; }
                if (this.revFlag) {set += this.REV; }
                set += this.FRAME;
                if (this.mixFlag) {set += this.MIX; }
            }
            var lastArray = this.sTable.table.row;
            if (stage < 1) {
                if ((set & 1)) {
                    this.filterArray = this.filtC(lastArray);
                } else {this.filterArray = undefined; }
            } else {lastArray = this.filterArray || this.sTable.table.row; }
            if (stage < 2) {
                if ((set & 2)) {
                    this.sortArray = this.sortC(lastArray);
                    lastArray = this.sortArray;
                } else {this.sortArray = undefined; } 
            } else {lastArray = this.sortArray || this.filterArray || this.sTable.table.row; }
            if (stage < 3) {
                if ((set & 4)) {
                    this.revArray = this.reverceC(lastArray);
                    lastArray = this.revArray;
                } else {this.revArray = undefined; }
            } else {lastArray = this.revArray || this.sortArray || this.filterArray || this.sTable.table.row; }
            if (stage < 4) {
                if ((set & 8)) {
                    this.frameArray = this.frameC(lastArray);
                    lastArray = this.frameArray;
                } else {this.frameArray = undefined; }
            } else {
                lastArray = this.frameArray || this.revArray || this.sortArray || this.filterArray || this.sTable.table.row;
            }
            if (stage < 5) {
                if ((set & 16)) {
                    this.mixArray = this.mixC(lastArray);
                    lastArray = this.mixArray;
                } else {this.mixArray = undefined; }
            } else {
                lastArray = this.mixArray || this.frameArray || this.revArray || this.sortArray || this.filterArray || this.sTable.table.row;
            }
            this.resultArray = lastArray;
            this.sTable.render.drawBody(this.resultArray);
            if (this.sTable.header) {this.headerProcessing(); }
        },
        /*run end }}}*/
        /* null function updateSortPriority (int num) /  {{{*/
        updateSortPriority : function (num) {
            this.sortPriority = [];
            this.sortPriority[0] = num;
            var i = 0;
            for (i = 0; i < this.name.length; i++) {
                if (i === num) {
                    continue;
                }
                this.sortPriority.push(i);
            }
        },
        /*updateSortPriority end }}}*/
        /* null function updateCellInRow (int r, int c, int vr) /  {{{*/
        updateCellInRow : function (r, c, vr) {
            if (this.updated[c]) {return; }
            var vc = this.findVCollFromModel(c);
            this.sTable.render.drawCell(this.resultArray[vr].cell[vc].get(), vr, vc, r, c);
            this.updated[c] = true;
            this.sorted[c] = false;
            if (this.alsoUpdate[c]) {
                var coll = 0;
                for (coll = 0; coll < this.alsoUpdate[c].length; coll++) {
                    this.updateCellInRow(r, this.alsoUpdate[c][coll], vr);
                }
            }
        },
        /*updateCellInRow end }}}*/ 
        /*null function updateCellFMC (int r, int c) /  {{{*/
        updateCellFMC : function (r, c) {
            this.updateCellInRow(r, c, this.findVRoeFromModel(r));
            this.updated = [];
        },
        /*updateCellFMC end }}}*/
        /* null function updateCellFVC (int r, int c) /  {{{*/
        updateCellFVC : function (r, c) {
            this.sTable.render.drawCell(this.resultArray[r].cell[c].get(), r, c, this.resultArray[r].num, this.resultArray[r].cell[c].num);
            this.updated[this.resultArray[r].cell[c].num] = true;
            if (this.alsoUpdate[this.resultArray[r].cell[c].num]) {
                var coll = 0;
                for (coll = 0; coll < this.alsoUpdate[this.resultArray[r].cell[c].num].length; coll++) {
                    this.updateCellInRow(this.resultArray[r].num, this.alsoUpdate[this.resultArray[r].cell[c].num][coll], r);
                }
            }
            this.updated = [];
        },
        /*updateCellFVC end }}}*/
        /* int function findVCollFromModel (int coll) /  {{{*/
        findVCollFromModel : function (coll) {
            return this.name.indexOf(this.sTable.table.name[coll]);
        },
        /*findVCollFromModel end }}}*/
        /* int function findVRowFromModel (int row) /  {{{*/
        findVRowFromModel : function (row) {
            var i = 0;
            for (i = 0; i < this.resultArray.length; i++) {
                if (this.resultArray[i].num === row) {return i;}
            }
            return -1;
        },
        /*findVRowFromModel end }}}*/
        /* null function swapColumn (int c1, int c2) /  {{{*/
        swapColumn : function (c1, c2) {
            var temp = this.name[c1];
            this.name[c1] = this.name[c2];
            this.name[c2] = temp;
            this.mixFlag = true;
            this.run(4);
        },
        /*swapColumn end }}}*/
        /* null function dellColumn (int c) /  {{{*/
        dellColumn : function (c) {
            this.name.splice(c, 1);
            this.mixFlag = true;
            this.run(4);
        },
        /*dellColumn end }}}*/
        /* null function sortBy (num) /  {{{*/
        sortBy : function (num) {
            this.sortFlag = true;
            if (this.sorted[num]) {
                if (this.revFlag) {
                    this.revFlag = false;
                } else {
                    this.revFlag = true;
                }
                this.run(2);
            } else {
                var i = 0;
                this.revFlag = false;
                this.updateSortPriority(num);
                this.run(1);
                for (i = 0; i < this.sorted.length; i++) {this.sorted[i] = false; }
                this.sorted[num] = true;
            }
        },
        /*sortBy end }}}*/
    };
    /*Conveyor end}}}*/
    /* obj function Conveyor (obj sTable) / conveyor constructor (controler) {{{*/
    var Conveyor = function (sTable) {
        Object.setPrototypeOf(this, conveyorProto);
        this.sTable = sTable;
        this.status = new SmartToggle();
        this.frame = new Frame(this);
        this.filter = [];
        this.sorter = [];
        this.sortPriority = [];
        this.sorted = [];
        this.name = [];
        this.sortFlag = false;
        this.mixFlag = false;
        this.revFlag = false;
        this.filterArray = [];
        this.sortArray = [];
        this.revArray = [];
        this.frameArray = [];
        this.mixArray = [];
        this.resultArray = [];
        this.alsoUpdate = [];
        this.updated = [];
    };
    /*Conveyor end }}}*/
    /*table elements  ---------------------------------------------------------------------------------------- {{{*/
    /* object : Cell prototype / cell prototype {{{*/
    var cellProto = {
        /* null function set (mix value) /  {{{*/
        set : function (value) {
            this.value = value;
        },
        /*set end }}}*/ 
        /* mix function get () /  {{{*/
        get : function () {
            return this.value;
        },
        /*get end }}}*/
        /* null function change (mix value) /  {{{*/
        change : function (value) {
            this.set(value);
            if (this.row.table.crow.indexOf(this.row) === -1) {
                this.row.table.crow.push(this.row);
            }
            this.row.table.sTable.conveyor.sorted[this.num] = false;
            if (this.row.table.status.get()) {
                this.row.table.sTable.conveyor.updateCellFMC(this.row.num, this.num);
            }
        },
        /*change end }}}*/
    };
    /*Cell end}}}*/
    /* obj function Cell (obj row) / cell constructor {{{*/
    var Cell = function (row) {
        Object.setPrototypeOf(this, cellProto);
        this.row = row;
        this.value = '';
        this.num = -1;
    };
    /*Cell end }}}*/
    /* object : Row prototype / row prototype {{{*/
    var rowProto = {
        /* null function addCells (array values) /  {{{*/
        addCells : function (values) {
            var i = 0;
            var key = '';
            if (Array.isArray(values)) {
                for (i = 0; i < values.length; i++) {
                    this.cell[i] = new Cell(this);
                    if (this.table.setter[i]) {this.cell[i].set = this.table.setter[i]; }
                    if (this.table.getter[i]) {this.cell[i].get = this.table.getter[i]; }
                    this.cell[i].set(values[i]);
                }
                for (i = 0; i < this.cell.length; i++) {
                    this.cell[i].num = i;
                }
                return;
            }
            if (typeof values !== 'object') {throw new Error("uncorect data"); }
            for (key in values) {
                if (values.hasOwnProperty(key)) {
                    i = this.table.getNumFromName(key);
                    this.cell[i] = new Cell(this);
                    this.cell[i].set = this.table.setter[i];
                    this.cell[i].get = this.table.getter[i];
                    this.cell[i].set(values[key]);
                }
            }
            for (i = 0; i < this.cell.length; i++) {
                this.cell[i].num = i;
            }
        },
        /*addCells end }}}*/
    };
    /*Row end}}}*/
    /* obj function Row (obj table) / row constructor {{{*/
    var Row = function (table) {
        Object.setPrototypeOf(this, rowProto);
        this.table = table;
        this.hiden = false;

        this.cell = [];
    };
    /*Row end }}}*/ 
    /*table elements end -------------------------------------------------------------------------------------- }}}*/
    /* object : Table prototype / table prototype (model) {{{*/
    var tableProto = {
        /* null function addGetter (int coll, fun funct) /  {{{*/
        addGetter : function (coll, funct) {
            this.getter[coll] = funct;
            var i = 0;
            for (i = 0; i < this.row.length; i++) {
                this.row[i].cell[coll].get = this.getter[coll];
            }
        },
        /*addGetter end }}}*/
        /* null function addSetter (int coll, fun funct) /  {{{*/
        addSetter : function (coll, funct) {
            this.setter[coll] = funct;
            var i = 0;
            for (i = 0; i < this.row.length; i++) {
                this.row[i].cell[coll].set = this.setter[coll];
            }
        },
        /*addSetter end }}}*/
        /* null function addRow (array data, [int num], [bool newF]) /  {{{*/
        addRow : function (data, num, newF) {
            if (typeof num === 'boolean') {newF = num; }
            if (newF === undefined) {newF = true; }
            if (typeof num !== 'number') {num = this.row.length; }
            var temp = new Row(this); 
            temp.addCells(data);
            this.row.splice(num, 0, temp);
            if (newF) {this.nrow.push(this.row[num]); }
            this.allRenum();
            this.sTable.conveyor.run();
        },
        /*addRow end }}}*/
        /* null function addRows (array data, [int num], [bool newF]) /  {{{*/
        addRows : function (data, num, newF) {
            if (typeof num === 'boolean') {newF = num; }
            if (newF === undefined) {newF = true; }
            if (typeof num !== 'number') {num = this.row.length; }
            this.status.set(false);
            this.sTable.conveyor.status.set(false);
            
            var temp = [];
            var i = 0;
            for (i=0; i < data.length; i++) {
                temp.push(new Row(this));
                temp[i].addCells(data[i]);
            }
            this.row.splice.apply(this.row, [num, 0].concat(temp));
            if (newF) {
                for (i = num; i < num + data.length; i++) {
                    this.nrow.push(this.row[i]);
                }
            }
            this.status.set(true);
            this.allRenum();
            this.sTable.conveyor.status.set(true);
            this.sTable.conveyor.run();
        },
        /*addRows end }}}*/
        /* null function removeRow (int num, [bool delF]) /  {{{*/
        removeRow : function (num, delF) {
            if (delF === undefined) {delF = true; }
            if (delF) {this.drow.push(this.row[num]); }
            this.row.splice(num, 1);
            this.allRenum();
            this.sTable.conveyor.run();
        },
        /*removeRow end }}}*/
        /* null function removeRows (int num, int col, [bool delF]) /  {{{*/
        removeRows : function (num, col, delF) {
            this.status.set(false);
            this.sTable.conveyor.status.set(false);
            if (delF === undefined) {delF = true; }
            var i = 0;
            if (delF) {
                for (i = num; i < num + col; i++) {
                    this.drow.push(this.row[i]);
                }
            }
            this.row.splice(num, col);
            this.status.set(true);
            this.allRenum();
            this.sTable.conveyor.status.set(true);
            this.sTable.conveyor.run();
        },
        /*removeRows end }}}*/
        /* int function getNumFromName (str name) /  {{{*/
        getNumFromName : function (name) {
            if (typeof name === 'number') {return name; }
            if (typeof name !== 'string') {throw new Error('uncorect name'); }
            var i = 0;
            for (i = 0; i < this.name.length; i++) {
                if (this.name[i] === name) {return i; }
            }
            throw new Error('uncorect name');
        },
        /*getNumFromName end }}}*/
        /* null function allRenum () /  {{{*/
        allRenum : function () {
            if (!this.status.get()) {return; }
            var i = 0;
            for (i = 0; i < this.row.length; i++) {
                this.row[i].num = i;
            }
        },
        /*allRenum end }}}*/
    };
    /*Table end}}}*/
    /* obj function Table (obj sTable) / table constructor (model) {{{*/
    var Table = function (sTable) {
        Object.setPrototypeOf(this, tableProto);
        this.sTable = sTable;
        this.status = new SmartToggle();

        this.getter = [];
        this.setter = [];
        this.header = [];
        this.name = [];

        this.row = [];
        this.nrow = [];
        this.crow = [];
        this.drow = [];
    };
    /*Table end }}}*/
    /* object : STable prototype / sTable prototype {{{*/
    var sTableProto = {
        lastId : 0,
        /* null function setLadout (int coll, obj ladout) / set ladout {{{*/
        setLadout : function (coll, ladout) {
            if (ladout.get) {this.table.addGetter(coll, ladout.get); }  
            if (ladout.set) {this.table.addSetter(coll, ladout.set); }
            this.table.header[coll] = ladout.header || ladout.name || "header" + coll;
            var tempName; 
            if (this.table.name[coll]) {
                tempName = this.table.name;
            }
            this.table.name[coll] = ladout.name || this.table.header[coll] + '_' + coll;
            if (tempName && this.conveyor.name.indexOf(tempName) > -1) {
                this.conveyor.name[this.conveyor.name.indexOf(tempName)] = this.table.name[coll];
            } else {
                this.conveyor.name[coll] = this.table.name[coll];
            }
            if (ladout.sort) {this.conveyor.addSortFunction(coll, ladout.sort); }
            if (ladout.filt) {this.conveyor.addFilterFunction(coll, ladout.filt); }
            if (ladout.alsoUpdate && Array.isArray(ladout.alsoUpdate)) {
                this.conveyor.addAlsoUpdate(coll, ladout.alsoUpdate);
            }
            var i = 0;
            if (ladout.updateIf && Array.isArray(ladout.updateIf)) {
                for (i = 0; i < ladout.updateIf.length; i++) {
                    this.conveyor.addAlsoUpdate(ladout.updateIf[i], coll);
                }
            }
            this.conveyor.sorted[coll] = false;

            if (!ladout.mode) {ladout.mode = 'show'; }
            this.render.setMode(coll, ladout.mode);
            if (ladout.drawE) {this.render.addDrawE(coll, ladout.drawE); }
            if (ladout.drawS) {this.render.addDrawS(coll, ladout.drawS); }

            if (ladout.click) {this.userHandler[coll] = ladout.click; }
        },
        /*setLadaut end }}}*/
        /* null function setLadouts (array ladout) /  {{{*/
        setLadouts : function (ladout) {
            var i = 0;
            for (i = 0; i < ladout.length; i++) {
                this.setLadout(i, ladout[i]);
            }
        },
        /*setLadouts end }}}*/
        /* null function draw () /  {{{*/
        draw : function () {
            if (this.header) {this.conveyor.headerProcessing(this.table.header); }
            this.conveyor.run();
        },
        /*draw end }}}*/
        /* null function addUserHandler (int coll, fun handler) /  {{{*/
        addUserHandler : function (coll, handler) {
            if (!this.userHandler[coll]) {
                this.userHandler[coll] = [];
            }
            this.userHandler[coll].push(handler);
        },
        /*addUserHandler end }}}*/
        /* null function changeHandler (event) /  {{{*/
        changeHandler : function (event) {
            var elem = STable.findSTable(event.target);
            var sTable = elem.sTable.table;
            var mr = elem.sTable.mRow;
            var mc = elem.sTable.mCell;
            sTable.table.status.set(false);
            if (event.target.tagName === "INPUT" && event.target.getAttribute('type') === 'checkbox') {
                sTable.table.row[mr].cell[mc].change(event.target.checked);
            } else {
                sTable.table.row[mr].cell[mc].change(event.target.value);
            }
            sTable.table.status.set(true);
        },
        /*changeHandler end }}}*/
        /* null function selectEvent (event) /  {{{*/
        selectHandler : function (event) {
            var elem = STable.findSTable(event.target);
            var sTable = elem.sTable.table;
            var vr = elem.sTable.vRow;
            var vc = elem.sTable.vCell;
            var type = elem.sTable.type;
            //var mr = elem.sTable.mRow;
            var mc = elem.sTable.mCell;
            if (type === 'header' && sTable.sortable) {
                sTable.render.clearCellEdit();
                sTable.conveyor.sortBy(mc);
                return;
            }
            if (type === 'cell' && sTable.render.mode[vc] === 'toggle') {
                if (elem.classList.contains('sTable_show')) {
                    sTable.render.toggleCell(vr, vc);
                }
            } else {
                sTable.render.clearCellEdit();
            }
            if (type === 'cell' && !elem.classList.contains('sTable_select')) {
                var input = elem.querySelector("input,textarea,select");
                if (input) {
                    input.focus();
                    input.select();
                    elem.setAttribute("tabindex","-1");
                }
                elem.classList.add('sTable_select');
            }
            var i = 0;
            if (!sTable.userHandler[mc]) {return; }
            for (i = 0; i < sTable.userHandler[mc].length; i++) {
                sTable.userHandler[mc][i].call(sTable, elem, elem.sTable);
            }
        },
        /*selectEvent end }}}*/ 
        /* null function deselectHandler (event) /  {{{*/
        deselectHandler : function (event) {
            var elem = STable.findSTable(event.target);
            if (elem.classList.contains('sTable_select')) {
                elem.classList.remove('sTable_select');
                elem.setAttribute("tabindex",elem.sTable.table.tabindex);
            }
        },
        /*deselectHandler end }}}*/
        /* null function enterEvent (event) /  {{{*/
        keyHandler : function (event) {
            if (event.keyCode === 13) {
                if (event.ctrlKey && event.target.tagName === "TEXTAREA") {
                    event.target.value += "\n";
                    return; 
                }
                var step = 1;
                var elem = STable.findSTable(event.target);
                var sTable = elem.sTable.table;
                var vr = elem.sTable.vRow;
                var vc = elem.sTable.vCell;
                var type = elem.sTable.type;
                if (event.shiftKey) {step = -step; }
                if (type === 'cell') {
                    event.preventDefault();
                    if (vr + step < 0) {return; }
                    if (vr + step >= sTable.render.tBody.rows.length) {return; }
                    var bEvent = new Event("blur");
                    var fEvent = new Event("focus");

                    elem.dispatchEvent(bEvent);
                    sTable.render.tBody.rows[vr + step].cells[vc].dispatchEvent(fEvent);
                }


            }
        },
        /*enterEvent end }}}*/
    };
    /*STable end }}}*/
    return function (container) {
        Object.setPrototypeOf(this, sTableProto);
        this.id = 'sTable_' + sTableProto.lastId++;
        this.userHandler = [];
        this.render = new Render(this);
        this.conveyor = new Conveyor(this);
        this.table = new Table(this);

        this.header = true;
        this.sortable = true;
        this.tabindex = 0;

        this.frame = this.conveyor.frame;

        this.render.init(container);

        container.addEventListener('click', this.selectHandler); 
        container.addEventListener('focus', this.selectHandler, true);
        container.addEventListener('blur', this.deselectHandler, true);
        container.addEventListener('keydown', this.keyHandler);
        container.addEventListener('change', this.changeHandler);
        container.addEventListener('input', this.changeHandler);
    };
}());
/*STable end}}}*/

/* dom function STable.findSTable (dom startElement) /  {{{*/
STable.findSTable = function (startElement) {
    "use strict";
    if (startElement.hasOwnProperty('sTable')) {return startElement; }
    return STable.findSTable(startElement.parentNode);
};
/*STable.findSTable end }}}*/



/*{{{
 * data format {
 *      data array of (object {
 *          name : value
 *      } || array of value)
 * }
 *
 * ladout format {
 *      header str, //optional
 *      name str, //optional
 *      get funct() // returned value,
 *      set funct(mix value) // set value,
 *
 *      sort funct(v1, v2)// return 1 if v1>v2; -1 if v1<v2; 0 if v1 == v2//optional
 *      filt funct(v)// return true/false //optional
 *      custom funct(v) // return v // optional
 *
 *      drawE funct // return domObject (cell),
 *      drawS funct // return domObject (cell),
 *      mode str // 'show', 'edit', 'toggle'
 *
 *      click funct(elem) // user handler for click
 * }
 }}}*/

/* sTable lib {{{*/
STable.lib = {
    /* object : Numbe prototype /  {{{*/
    numberValueProto : {
        set : function (value) {
            "use strict";
            this.value = +value; 
        },
        get : function (value) {
            "use strict";
            return this.value; 
        },
        drawS : function (value) {
            "use strict";
            var div = document.createElement('div');
            div.innerHTML = value;
            return div;
        },
        sort : function (a, b) {
            "use strict";
            if (a > b) {return 1; }
            if (a < b) {return -1; }
            return 0;
        },
        drawE : function (value) {
            "use strict";
            var input = document.createElement('input');
            input.setAttribute('type', 'number');
            input.value = value;
            return input;
        },
    },
    /*NumberValue end}}}*/
    /* obj function NumberValue (bool editable, str header, str name) / return ladout object {{{*/
    NumberValue : function (editable, header, name) {
        "use strict";
        Object.setPrototypeOf(this, STable.lib.numberValueProto);
        this.mode = editable ? "toggle" : "show";
        this.header = header || "number";
        if (typeof name === 'string') {this.name = name; }
    },
    /*NumberValue end }}}*/
    /* object : CheckValue prototype /  {{{*/
    checkValueProto : {
        set : function (value) {
            "use strict";
            this.value = !!value; 
        },
        get : function (value) {
            "use strict";
            return this.value; 
        },
        sort : function (a, b) {
            "use strict";
            if (a && !b) {return -1; }
            if (!a && b) {return 1; }
            return 0;
        },
        drawS : function (value) {
            "use strict";
            var div = document.createElement('div');
            div.innerHTML = value ? "on" : "off";
            return div;
        },
        drawE : function (value) {
            "use strict";
            var input = document.createElement('input');
            input.setAttribute('type', 'checkbox');
            input.checked = value;
            return input;
        },
    },
    /*Check end}}}*/
    /* obj function CheckValue (bool editable, str header, str name) /  {{{*/
    CheckValue : function (editable, header, name) {
        "use strict";
        Object.setPrototypeOf(this, STable.lib.checkValueProto);
        this.mode = editable ? "edit" : "show";
        this.header = header || "check";
        if (typeof name === 'string') {this.name = name; }
    },
    /*CheckValue end }}}*/
    /* object : TextValue prototype /  {{{*/
    textValueProto : {
        set : function (value) {
            "use strict";
            this.value = value.toString(); 
        },
        get : function (value) {
            "use strict";
            return this.value; 
        },
        drawS : function (value) {
            "use strict";
            var div = document.createElement('div');
            div.innerHTML = value;
            return div;
        },
        sort : function (a, b) {
            "use strict";
            if (a > b) {return 1; }
            if (a < b) {return -1; }
            return 0;
        },
        drawE : function (value) {
            "use strict";
            var input = document.createElement('input');
            input.value = value;
            return input;
        },
    },
    /*TextValue end}}}*/
    /* null function TextValue (bool editable, str header, str name) /  {{{*/
    TextValue : function (editable, header, name) {
        "use strict";
        Object.setPrototypeOf(this, STable.lib.textValueProto);
        this.mode = editable ? "toggle" : "show";
        this.header = header || "text";
        if (typeof name === 'string') {this.name = name; }
    },
    /*TextValue end }}}*/
    /* object : MultiTextValue prototype /  {{{*/
    multiTextValueProto : {
        set : function (value) {
            "use strict";
            this.value = value.toString(); 
        },
        get : function (value) {
            "use strict";
            return this.value; 
        },
        drawS : function (value) {
            "use strict";
            var div = document.createElement('div');
            div.innerHTML = value.replace(/\n/gm, "<br>");
            return div;
        },
        sort : function (a, b) {
            "use strict";
            if (a > b) {return 1; }
            if (a < b) {return -1; }
            return 0;
        },
        drawE : function (value) {
            "use strict";
            var input = document.createElement('textarea');
            input.value = value;
            return input;
        },
    },
    /*MultiTextValue end}}}*/
    /* null function MultiTextValue (bool editable, str header, str name) /  {{{*/
    MultiTextValue : function (editable, header, name) {
        "use strict";
        Object.setPrototypeOf(this, STable.lib.multiTextValueProto);
        this.mode = editable ? "toggle" : "show";
        this.header = header || "multiText";
        if (typeof name === 'string') {this.name = name; }
    },
    /*MultiTextValue end }}}*/
    /* object : DateValue prototype /  {{{*/
    dateValueProto : {
        set : function (value) {
            "use strict";
            var temp = value.toString();
            var match = temp.match(/(\d{4}).(\d{1,2}).(\d{1,2})/);
            if (!match) {return; }
            if (match[2].length < 2) {match[2] = '0' + match[2]; }
            if (match[3].length < 2) {match[3] = '0' + match[3]; }
            this.value = match[1] + '-' + match[2] + '-' + match[3]; 

        },
        get : function (value) {
            "use strict";
            return this.value; 
        },
        drawS : function (value) {
            "use strict";
            var div = document.createElement('div');
            div.innerHTML = value;
            return div;
        },
        sort : function (a, b) {
            "use strict";
            a = Date.parse(a);
            b = Date.parse(b);
            if (a > b) {return 1; }
            if (a < b) {return -1; }
            return 0;
        },
        drawE : function (value) {
            "use strict";
            var input = document.createElement('input');
            input.setAttribute("type","date");
            input.value = value;
            return input;
        },

    },
    /*DateValue end}}}*/
    /* obj function DateValue (bool editable, str header, str name) /  {{{*/
    DateValue : function (editable, header, name) {
        "use strict";
        Object.setPrototypeOf(this, STable.lib.dateValueProto);
        this.mode = editable ? "toggle" : "show";
        this.header = header || "date";
        if (typeof name === 'string') {this.name = name; }
    },
    /*DateValue end }}}*/
    /* object : TimeValue prototype /  {{{*/
    timeValueProto : {
        set : function (value) {
            "use strict";
            var temp = value.toString();
            var match = temp.match(/(\d{1,2}).(\d{1,2})/);
            if (!match) {return; }
            if (match[2].length < 2) {match[2] = '0' + match[2]; }
            if (match[1].length < 2) {match[1] = '0' + match[1]; }
            this.value = match[1] + ':' + match[2]; 

        },
        get : function (value) {
            "use strict";
            return this.value; 
        },
        drawS : function (value) {
            "use strict";
            var div = document.createElement('div');
            div.innerHTML = value;
            return div;
        },
        sort : function (a, b) {
            "use strict";
            a = Date.parse(a);
            b = Date.parse(b);
            if (a > b) {return 1; }
            if (a < b) {return -1; }
            return 0;
        },
        drawE : function (value) {
            "use strict";
            var input = document.createElement('input');
            input.setAttribute("type","time");
            input.value = value;
            return input;
        },

    },
    /*TimeValue end}}}*/
    /* null function TimeValue (bool editable, str header, str name) /  {{{*/
    TimeValue : function (editable, header, name) {
        "use strict";
        Object.setPrototypeOf(this, STable.lib.timeValueProto);
        this.mode = editable ? "toggle" : "show";
        this.header = header || "time";
        if (typeof name === 'string') {this.name = name; }
    },
    /*TimeValue end }}}*/
    /* object : CompValue prototype /  {{{*/
    compValueProto : {
        set : function (value) {
            "use strict";
            this.value = value;
        },
        drawS : function (value) {
            "use strict";
            var div = document.createElement('div');
            div.innerHTML = value;
            return div;
        },
        sort : function (a, b) {
            "use strict";
            if (a > b) {return 1; }
            if (a < b) {return -1; }
            return 0;
        },
    },
    /*CompValue end}}}*/
    /* null function CompValue (fun funct, array numOfArg, str header, str name) /  {{{*/
    CompValue : function (funct, numOfArg, header, name) {
        "use strict";
        Object.setPrototypeOf(this, STable.lib.compValueProto);
        this.mode = 'show';
        this.header = header || "function";
        if (typeof name === 'string') {this.name = name; }
        this.updateIf = numOfArg;
        this.get = (function(f, ar) {
            return function(){
                var i = 0;
                var arg = [];
                for (i = 0; i < f.length; i++) {
                    arg.push(this.row.cell[ar[i]].get());
                }
                return f.apply(this, arg);
            };
        }(funct, numOfArg));
    },
    /*CompValue end }}}*/
    /* object : CalcValue prototype /  {{{*/
    calcValueProto : {
        set : function (value) {
            "use strict";
            value = value.toString();
            if (!/^[\d\+\.\*\/\-\%\,]+$/.test(value)) {return; }
            if (!/\d$/.test(value)) {return; }
            value = value.replace(',' ,'.');
            this.value = eval(value); 

        },
        get : function (value) {
            "use strict";
            return this.value; 
        },
        drawS : function (value) {
            "use strict";
            var div = document.createElement('div');
            div.innerHTML = value;
            return div;
        },
        sort : function (a, b) {
            "use strict";
            a = Date.parse(a);
            b = Date.parse(b);
            if (a > b) {return 1; }
            if (a < b) {return -1; }
            return 0;
        },
        drawE : function (value) {
            "use strict";
            var input = document.createElement('input');
            input.value = value;
            return input;
        },
        
    },
    /*CalcValue end}}}*/
    /* obj function CalcValue (str header, str name) /  {{{*/
    CalcValue : function (header, name) {
        "use strict";
        Object.setPrototypeOf(this, STable.lib.calcValueProto);
        this.mode = "toggle";
        this.header = header || "time";
        if (typeof name === 'string') {this.name = name; }
    },
    /*CalcValue end }}}*/
};

/* sTable lib end}}}*/







