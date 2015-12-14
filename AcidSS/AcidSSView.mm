#import "AcidSSView.h"

@implementation AcidSSView
{
    OpenGLRenderer* renderer;
    float dt;
    float time;
}

- (id)initWithFrame:(NSRect)frame isPreview:(BOOL)isPreview
{
    self = [super initWithFrame:frame isPreview:isPreview];
    
    if (self)
    {
        NSOpenGLPixelFormatAttribute attributes[] =
        {
            NSOpenGLPFADoubleBuffer,
            NSOpenGLPFADepthSize, 24,
            NSOpenGLPFAOpenGLProfile,
            NSOpenGLProfileVersion3_2Core,
            0
        };
        NSOpenGLPixelFormat *format;
        format = [[NSOpenGLPixelFormat alloc] initWithAttributes:attributes];
        glView = [[MyOpenGLView alloc] initWithFrame:NSZeroRect pixelFormat:format];
        
        if (!glView)
        {
            NSLog( @"Couldn't initialize OpenGL view." );
            return nil;
        }
        
        [self addSubview:glView];
        
        dt = 1 / 60.0;
        time = 0.0;
        [self setAnimationTimeInterval: dt];
        
        [[glView openGLContext] makeCurrentContext];
        renderer = [[OpenGLRenderer alloc] initWithDefaultFBO: 0];
    }
    
    return self;
}

- (void)setFrameSize:(NSSize)newSize
{
    [super setFrameSize:newSize];
    [glView setFrameSize:newSize];
    
    [[glView openGLContext] makeCurrentContext];
    [renderer resizeWithWidth: newSize.width AndHeight: newSize.height];
    [[glView openGLContext] update];
}

- (void)startAnimation
{
    [super startAnimation];
}

- (void)stopAnimation
{
    [super stopAnimation];
}

- (void)drawRect:(NSRect)rect
{
    [super drawRect:rect];
    
    [[glView openGLContext] makeCurrentContext];
    [renderer render: time];
    [[glView openGLContext] flushBuffer];
}

- (void)animateOneFrame
{
    time += dt;
    [self setNeedsDisplay:YES];
}

- (BOOL)hasConfigureSheet
{
    return NO;
}

- (NSWindow*)configureSheet
{
    return nil;
}

@end
