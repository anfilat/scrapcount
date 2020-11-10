import React from 'react';
import {Link as RouterLink} from 'react-router-dom';
import {Container, Box, Button, TextField, Link, Typography} from '@material-ui/core';
import {withStyles} from '@material-ui/core/styles';
import {withSnackbar} from 'notistack';
import history from "../services/history";
import Copyright from '../components/Copyright';
import Title from '../components/Title';
import {AuthContext} from '../context/AuthContext';
import {bindField, bindShowSuccess, bindShowError, request} from '../utils';

const styles = theme => ({
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    form: {
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
});

class RegisterPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            loading: false,
        };
        this.emailChangeHandler = bindField(this, 'email');
        this.passwordChangeHandler = bindField(this, 'password');
        this.showSuccess = bindShowSuccess(this);
        this.showError = bindShowError(this);
        this.requestCancel = null;
    }

    static contextType = AuthContext;

    componentWillUnmount() {
        this.stopRequest();
    }

    registerHandler = (event) => {
        event.preventDefault();

        const {email, password} = this.state;
        request(this, '/api/auth/register', {
                email,
                password,
            },
            false
        ).then(this.onRegisterResult);
    }

    onRegisterResult = ({ok, data, error, abort}) => {
        if (abort) {
            return;
        }

        if (ok) {
            this.showSuccess(data.message);
            this.context.login(data.userId);
            history.push('/');
        } else {
            this.showError(error);
        }
    }

    stopRequest() {
        if (this.requestCancel) {
            this.requestCancel();
            this.requestCancel = null;
            this.setState({loading: false});
        }
    }

    render() {
        const {email, password, loading} = this.state;
        const classes = this.props.classes;

        return (
            <Container component="main" maxWidth="xs">
                <Title title="Register"/>
                <div className={classes.paper}>
                    <Typography component="h1" variant="h5">
                        Register
                    </Typography>
                    <form className={classes.form} noValidate onSubmit={this.registerHandler}>
                        <TextField
                            label="Email Address"
                            type="email"
                            variant="outlined"
                            margin="normal"
                            autoComplete="email"
                            value={email}
                            onChange={this.emailChangeHandler}
                            required
                            fullWidth
                            autoFocus
                        />
                        <TextField
                            label="Password"
                            type="password"
                            variant="outlined"
                            margin="normal"
                            autoComplete="current-password"
                            value={password}
                            onChange={this.passwordChangeHandler}
                            required
                            fullWidth
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.submit}
                            disabled={loading}
                        >
                            Register
                        </Button>
                        <Box display="flex" justifyContent="flex-end">
                            <Link component={RouterLink} to="/" variant="body2">
                                Already have an account? Login
                            </Link>
                        </Box>
                    </form>
                </div>
                <Box mt={8}>
                    <Copyright/>
                </Box>
            </Container>
        );
    }
}

export default withStyles(styles)(withSnackbar(RegisterPage));
