import { useEffect, useState } from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

async function fetchInfo(setData) {
    try {
        const token = localStorage.getItem('auth');
        const res = await fetch('http://localhost:8000/api/auth/leaderboard', {
            method: 'GET',
            headers: { "Authorization": `Bearer ${token}` },
        });

        const resJson = await res.json();

        if (res.status !== 200) {
            console.log(res.info);
            setData([]);
        }
        else {
            setData(resJson);
        }

    } catch (error) {
        // show error
        setData([]);
    }
}

const useStyles = makeStyles((theme) => ({
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: 'white',
        backgroundColor: 'transparent'
    },
    table: {
        minWidth: 600,
    },
}));

const parseLeaderboardData = (data) => {
    let leaderboard = [];

    let dummy = [];
    for (let i = 0; i < 10; i++) {
        dummy.push({ username: 'nigga', highscore: 42069 });
    }
    
    data && data.forEach(e => {
        leaderboard.push(
            <TableRow key={e.username} style={{ backgroundColor: '#F24141' }}>
                <TableCell align="center">
                    {e.username}
                </TableCell>
                <TableCell>{e.highscore}</TableCell>
            </TableRow>
        )
    });

    return leaderboard;
}

const LeaderBoard = () => {
    const [leaderBoardData, setData] = useState(null);
    const classes = useStyles();
    useEffect(() => !leaderBoardData && fetchInfo(setData), []);

    const headerStyle = { backgroundColor: '#49BFB3' };

    return (
        <div>

            <TableContainer component={Paper}>
                <Table className={classes.table} aria-label="simple table">
                    <TableHead>
                        <TableRow style={headerStyle}>
                            <TableCell align="center">User</TableCell>
                            <TableCell>Score</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {parseLeaderboardData(leaderBoardData)}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}

export default LeaderBoard;