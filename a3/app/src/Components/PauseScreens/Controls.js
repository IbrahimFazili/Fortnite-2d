import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: 'white',
    backgroundColor: 'transparent'
  },
}));

const Controls = () =>{
    const classes = useStyles();

    return (
        <div>
            <Grid container spacing={3}>
                <Grid item xs={6}>
                    <Paper className={classes.paper}>
                        Press 'W' key to move up
                    </Paper>
                </Grid>
                <Grid item xs={6}>
                    <Paper className={classes.paper}>
                        Move your move mouse in the direction you want to shoot
                    </Paper>
                </Grid>
                <Grid item xs={6}>
                    <Paper className={classes.paper}>
                        Press 'A' key to move left
                    </Paper>
                </Grid>
                <Grid item xs={6}>
                    <Paper className={classes.paper}>
                        Left click to shoot
                    </Paper>
                </Grid>                
                <Grid item xs={6}>
                    <Paper className={classes.paper}>
                        Press 'S' key to move down
                    </Paper>
                </Grid>
                <Grid item xs={6}>
                    <Paper className={classes.paper}>
                        Hold left mouse to continuously shoot
                    </Paper>
                </Grid> 
                <Grid item xs={6}>
                    <Paper className={classes.paper}>
                        Press 'D' key to move right
                    </Paper>
                </Grid>
                <Grid item xs={6}>
                    <Paper className={classes.paper}>
                    Aim your mouse in the direction you want and press 'X' to drop a brick wall (10 bricks)
                    </Paper>
                </Grid> 
                <Grid item xs={6}>
                    <Paper className={classes.paper}>
                        Press 'F' to pickup an item
                    </Paper>
                </Grid>
                <Grid item xs={6}>
                    <Paper className={classes.paper}>
                    Aim your mouse in the direction you want and press 'C' to drop a steel wall (35 steel)
                    </Paper>
                </Grid> 
            </Grid>
        </div>
    );
}

export default Controls;