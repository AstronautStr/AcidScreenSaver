#pragma once
#include "shader.h"


struct program
{
    program();
    ~program();

    bool create();
    void attach(shader const& sh);
    bool link();
    void use();

    GLenum get() const;

    GLstring lastError() const;

    operator GLenum() const;

private:
    GLenum mProg;
};
