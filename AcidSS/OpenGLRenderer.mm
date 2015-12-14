#import "OpenGLRenderer.h"

@interface OpenGLRenderer ()
{
    GLuint _viewWidth;
    GLuint _viewHeight;
    
    GLuint VBO;
    GLuint VAO;
    program plain;
}
@end

@implementation OpenGLRenderer


- (void) resizeWithWidth:(GLuint)width AndHeight:(GLuint)height
{
	glViewport(0, 0, width, height);

	_viewWidth = width;
	_viewHeight = height;
}

- (void) render: (float) time
{
    // Rendering
    glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    
    plain.use();
    GLint dtShaderUniform = glGetUniformLocation(plain.get(), "time");
    glUniform1f(dtShaderUniform, time);
    
    GLint sw = glGetUniformLocation(plain.get(), "screenWidth");
    glUniform1f(sw, _viewWidth);
    GLint sh = glGetUniformLocation(plain.get(), "screenHeight");
    glUniform1f(sh, _viewHeight);
    
    glBindVertexArray(VAO);
    glDrawArrays(GL_TRIANGLE_STRIP, 0, 4);
    glBindVertexArray(0);
}

- (id) initWithDefaultFBO: (GLuint) defaultFBOName
{
	if((self = [super init]))
	{
		NSLog(@"%s %s", glGetString(GL_RENDERER), glGetString(GL_VERSION));
		
		_viewWidth = 100;
		_viewHeight = 100;

        glEnable(GL_DEPTH_TEST);
        
        if (!plain.create())
        {
            NSLog(@"program creation error %s", plain.lastError().c_str());
        }
        
        {
            // Shaders
            shader vertexShader;
            NSString* vsPath = [[NSBundle bundleForClass:[self class]] pathForResource:@"plain" ofType:@"vert"];
            if (!vertexShader.compile(readAllText([vsPath cStringUsingEncoding:NSASCIIStringEncoding]), GL_VERTEX_SHADER))
            {
                NSLog(@"vertex shader compilation error %s", vertexShader.lastError().c_str());
            }
            shader fragmentShader;
            NSString* fsPath = [[NSBundle bundleForClass:[self class]] pathForResource:@"generator" ofType:@"frag"];
            if (!fragmentShader.compile(readAllText([fsPath cStringUsingEncoding:NSASCIIStringEncoding]), GL_FRAGMENT_SHADER))
            {
                NSLog(@"fragment shader compilation error %s", fragmentShader.lastError().c_str());
            }
            
            // Shader program
            plain.attach(vertexShader);
            plain.attach(fragmentShader);
            if (!plain.link())
            {
                NSLog(@"program linking error %s", plain.lastError().c_str());
            }
        }
        
        // Cube data
        GLfloat vertices[] =
        {
            1.0f,   1.0f,   0.0f,
            1.0f,   -1.0f,  0.0f,
            -1.0f,  1.0f,   0.0f,
            -1.0f,  -1.0f,   0.0f
        };
        
        
        glGenBuffers(1, &VBO);
        glBindBuffer(GL_ARRAY_BUFFER, VBO);
        glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);
        
        glGenVertexArrays(1, &VAO);
        glBindVertexArray(VAO);
        {
            glBindBuffer(GL_ARRAY_BUFFER, VBO);
            glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(GLfloat), static_cast<GLvoid*>(0));
            glEnableVertexAttribArray(0);
        }
        glBindVertexArray(0);
        
        [self render: 0.0];

        GetGLError();
	}
	
	return self;
}


- (void) dealloc
{
    glDeleteVertexArrays(1, &VAO);
    glDeleteBuffers(1, &VBO);
}

@end
