import React, {useContext, useRef} from 'react';
import CKEditor from '@ckeditor/ckeditor5-react';
import {Box, Button, Container, Grid} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {useSnackbar} from 'notistack';
import {Title} from '../components/Title';
import {useBindLocalStorage} from '../hooks/bindLocalStorage.hook';
import {AuthContext} from '../context/AuthContext'
import {useHttp} from '../hooks/http.hook';
import 'ckeditor5-custom-build/build/ckeditor';

const useStyles = makeStyles(theme => ({
    editor: {
        '& .ck-editor': {
            height: `calc(100vh - 64px - ${theme.spacing(6)}px - 36px)`,
            display: 'flex',
            'flex-direction': 'column',
            '& .ck-editor__main': {
                'flex-grow': 1,
                overflow: 'auto',
                '& .ck-content': {
                    height: '100%',
                }
            }
        }
    },
}));

const config = {
    toolbar: [
        "heading", "|",
        "bold", "italic", "strikethrough",  "|",
        "link", "bulletedList", "numberedList", "|",
        "alignment", "indent", "outdent", "|",
        "code", "codeBlock", "insertTable", "|",
        "undo", "redo"
    ],
};

export const NewPage = () => {
    const classes = useStyles();
    const editorInstance = useRef(null);
    const {enqueueSnackbar} = useSnackbar();
    const auth = useContext(AuthContext)
    const {loading, request} = useHttp();
    const [content, setContent] = useBindLocalStorage('newData', 'content', '');

    function initEditor(editor) {
        editorInstance.current = editor;
        focusEditor(editor);
    }

    function changeEditor(event, editor) {
        setContent(editor.getData());
    }

    function clickReset() {
        setContent('');
        focusEditor(editorInstance.current);
    }

    async function clickSave() {
        const {ok, data, error} = await request('/api/item/add', 'POST', {
            text: content
        }, {
            Authorization: `Bearer ${auth.token}`
        });
        if (ok) {
            console.log(data.itemId);
            enqueueSnackbar(data.message, {
                variant: 'success',
            });
        } else {
            enqueueSnackbar(error, {
                variant: 'error',
            });
        }

        focusEditor(editorInstance.current);
    }

    function focusEditor(editor) {
        editor.editing.view.focus();
        editor.model.change(writer => {
            writer.setSelection(writer.createPositionAt(editor.model.document.getRoot(), 'end'));
        });
    }

    return (
        <>
            <Title title="New"/>
            <Container component="main" maxWidth="md">
                <Box mt={2} mb={2} className={classes.editor}>
                    <CKEditor
                        editor={ window.Editor || window.ClassicEditor }
                        config={config}
                        data={content}
                        onInit={initEditor}
                        onChange={changeEditor}
                    />
                </Box>
                <Grid
                    container
                    direction="row"
                    justify="flex-end"
                    spacing={2}
                >
                    <Grid item>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={clickReset}
                            disabled={loading}
                        >
                            Reset
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={clickSave}
                            disabled={loading}
                        >
                            Save
                        </Button>
                    </Grid>
                </Grid>
            </Container>
        </>
    );
};
