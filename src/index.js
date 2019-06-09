import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class SizeForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value: 's'};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    handleSubmit(event) {
        //console.log('Selected size: ' + this.state.value);
        event.preventDefault();
        this.props.onFinish(this.state.value);
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <label>
                    Pick the size of the mine field:
                    <span>&nbsp;&nbsp;</span>
                    <select value={this.state.value} onChange={this.handleChange}>
                        <option value="s">small (10x10)</option>
                        <option value="m">medium (15x15)</option>
                        <option value="l">large (20x20)</option>
                        <option value="xl">huge (50x25)</option>
                    </select>
                </label>
                <span>&nbsp;&nbsp;</span>
                <input type="submit" value="Submit" />
            </form>
        );
    }
}


function Square(props) {
    return (
        <button className ={props.className} onClick={props.onClick}>
            {props.value}
        </button>
    );
}

class Board extends React.Component {

    // normal square
    renderSquare(x,y) {
      return (<Square
          className={"square"}
          key={x.toString() + ',' + y.toString()}
          value={this.props.squares[x][y]}
          onClick = {(e) => this.props.onClick(x,y,e)}
          onContextMenu = {(e) => this.props.onClick(x,y,e)}
      />);
    }

    render() {

        let x = this.props.x;
        let y = this.props.y;

        return (
            <div key ={'mainboard'}>
            {
                Array.apply(null, {length: x}).map(Number.call, Number).map((i) => {
                    return(
                        <div className="board-row" key={'board' + i}>
                        {
                            Array.apply(null, {length: y}).map(Number.call, Number).map( (j) => {
                                return this.renderSquare(i, j);
                            })
                        }
                        </div>
                    );
                })
            }
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props)
    {
        super(props);
        this.state = {

            squares: null,
            x : 0,
            y : 0,
            bombs: null,
            clickMode: true, // true => try, false => flag
            renderinit: true,
            lost: false,
        }
    }

    handleClick(x,y,e)
    {
        //e.preventDefault();

        if(this.state.lost || checkIfWon(this.state.squares, this.state.bombs))
            return;

        const squares = this.state.squares.slice();
        const bombs = this.state.bombs;

        let recurse = false;

        if(!squares[x][y])
        {
            if(!this.state.clickMode) // e.button === 3||
            {
                squares[x][y] = '🚩';
            }
            else
            {
                if(bombs[x][y] === '💣')
                {
                    squares[x][y] = '💣';
                    this.setState({lost: true});
                }
                else squares[x][y] = bombs[x][y];
                if(squares[x][y] === 0)
                    recurse = true;
            }
        }
        else if(squares[x][y] === '🚩')
        {
            squares[x][y] = null;
        }

        this.setState({squares: squares,});

        if(recurse)
        {
            let a = x;
            let b = y;
            if(a>0)
            {
                if(squares[a-1][b] === null)
                    this.handleClick(a-1, b, null);
                if(b>0 && squares[a-1][b-1] === null)
                    this.handleClick(a-1, b-1, null);
                if(b<this.state.y-1 && squares[a-1][b+1] === null)
                    this.handleClick(a-1, b+1, null);
            }
            if(a<this.state.x-1)
            {
                if(squares[a+1][b] === null)
                    this.handleClick(a+1, b, null);
                if(b>0 && squares[a+1][b-1] === null)
                    this.handleClick(a+1, b-1, null);
                if(b<this.state.y-1 && squares[a+1][b+1] === null)
                    this.handleClick(a+1, b+1, null);
            }
            if(b > 0 && squares[a][b-1] === null)
                this.handleClick(a, b-1, null);
            if(b < this.state.y-1 && squares[a][b+1] === null)
                this.handleClick(a, b+1, null);
        }

    }

    /**
     * toggles between sorting history in descending or ascending order
     */
    clickToggle()
    {
        this.setState({clickMode: !this.state.clickMode});
        //console.log("toggled to: " + this.state.toggle);
    }

    clickRestart()
    {
        this.setState({squares: null,
            x : 0,
            y : 0,
            bombs: null,
            clickMode: true, // true => try, false => flag
            renderinit: true,
            lost: false,
        });
    }

    initiateBoard(size)
    {
        console.log('initiating with board size ' + size);
        this.setState({renderinit: false});

        const sizes = {
            s : [10,10],
            m : [15,15],
            l : [20,20],
            xl: [25,50],
        };

        const numberBombs = {
            s : 10,
            m : 25,
            l : 50,
            xl: 150,
        }

        let x,y;
        [x,y] = sizes[size];

        var squares = new Array(x).fill(0).map(() => new Array(y).fill(null));
        var bombs = new Array(x).fill(0).map(() => new Array(y).fill(0));

        // fill field with mines
        for(let i=0; i < numberBombs[size]; i++)
        {
            let a = Math.floor(Math.random() * x);
            let b = Math.floor(Math.random() * y);

            //increase numbers in surrounding fields
            if(bombs[a][b] !== '💣')
            {
                bombs[a][b] = '💣';

                if(a>0)
                {
                    if(bombs[a-1][b] !== '💣')
                        bombs[a-1][b]++;
                    if(b>0 && bombs[a-1][b-1] !== '💣')
                        bombs[a-1][b-1]++;
                    if(b<y-1 && bombs[a-1][b+1] !== '💣')
                        bombs[a-1][b+1]++;
                }
                if(a<x-1)
                {
                    if(bombs[a+1][b] !== '💣')
                        bombs[a+1][b]++;
                    if(b>0 && bombs[a+1][b-1] !== '💣')
                        bombs[a+1][b-1]++;
                    if(b<y-1 && bombs[a+1][b+1] !== '💣')
                        bombs[a+1][b+1]++;
                }
                if(b > 0 && bombs[a][b-1] !== '💣')
                    bombs[a][b-1]++;
                if(b < y-1 && bombs[a][b+1] !== '💣')
                    bombs[a][b+1]++;
            }
            else
            {
                //console.log('else!')
                i--;
            }
        }

        console.table(bombs)

        this.setState({
            x: x,
            y: y,
            squares: squares,
            bombs: bombs,
        });

    }

    render()
    {
        if(this.state.renderinit)
            return (<div className="select-board">
                        <SizeForm
                            onFinish = {(size) => this.initiateBoard(size)}
                        />
                    </div>);

        const toggleButton = <button onClick={() => this.clickToggle()}>{
            "Mode: " + (this.state.clickMode ? "⌖" : "🚩")}
        </button>;


        let restartButton = null;

        if(this.state.lost)
        {
            restartButton = <button onClick={() => this.clickRestart()}>{"Restart"}</button>;
        }

        if(checkIfWon(this.state.squares, this.state.bombs))
        {
            restartButton = <button onClick={() => this.clickRestart()}>{"😎 Restart 😎"}</button>;
        }

        return (
          <div className="game">
            <div className="game-board">
              <Board
                squares = {this.state.squares}
                bombs = {this.state.bombs}
                x = {this.state.x}
                y = {this.state.y}
                onClick = {(x,y,e) => this.handleClick(x,y,e)}
              />
            </div>
              <span>&nbsp;&nbsp;</span>
              <div>{toggleButton}</div>
              <div>{restartButton}</div>
          </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);

function checkIfWon(squares, bombs)
{
    for(let i in squares)
        for(let j in i)
        {
            if(bombs[i][j] !== '💣' && (squares[i][j] === null || squares[i][j] === '🚩'))
                return false;
        }
    return true;

}