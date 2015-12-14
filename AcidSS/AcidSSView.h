#import <ScreenSaver/ScreenSaver.h>
#import <OpenGL/gl.h>
#import <OpenGL/glu.h>
#import "MyOpenGLView.h"
#import "program.h"
#import "OpenGLRenderer.h"

@interface AcidSSView : ScreenSaverView
{
    MyOpenGLView *glView;
    GLfloat rotation;
}

@end
